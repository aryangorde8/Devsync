"""
Views for the portfolio app.

This module provides API views for projects, skills,
and other portfolio-related endpoints.
"""

from django.db.models import Count, Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Experience, Project, Skill, SocialLink
from .serializers import (
    DashboardStatsSerializer,
    ExperienceSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations.
    
    Provides list, create, retrieve, update, and delete actions.
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for list and detail."""
        if self.action == "list":
            return ProjectListSerializer
        return ProjectDetailSerializer
    
    def get_queryset(self):
        """Filter projects by current user."""
        return Project.objects.filter(user=self.request.user).prefetch_related("skills")
    
    @action(detail=False, methods=["get"])
    def featured(self, request: Request) -> Response:
        """Get featured projects."""
        projects = self.get_queryset().filter(is_featured=True)[:6]
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def toggle_featured(self, request: Request, pk=None) -> Response:
        """Toggle project featured status."""
        project = self.get_object()
        project.is_featured = not project.is_featured
        project.save()
        return Response({"is_featured": project.is_featured})


class SkillViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Skill CRUD operations.
    """
    
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter skills by current user."""
        return Skill.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=["get"])
    def by_category(self, request: Request) -> Response:
        """Get skills grouped by category."""
        skills = self.get_queryset()
        grouped = {}
        for skill in skills:
            category = skill.get_category_display()
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(SkillSerializer(skill).data)
        return Response(grouped)


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Experience CRUD operations.
    """
    
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter experiences by current user."""
        return Experience.objects.filter(user=self.request.user).prefetch_related("skills")


class SocialLinkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SocialLink CRUD operations.
    """
    
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter social links by current user."""
        return SocialLink.objects.filter(user=self.request.user)


class DashboardStatsView(APIView):
    """
    API view for dashboard statistics.
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        """Get dashboard statistics for the current user."""
        user = request.user
        
        projects = Project.objects.filter(user=user)
        stats = {
            "total_projects": projects.count(),
            "completed_projects": projects.filter(status="completed").count(),
            "in_progress_projects": projects.filter(status="in_progress").count(),
            "total_skills": Skill.objects.filter(user=user).count(),
            "total_experiences": Experience.objects.filter(user=user).count(),
            "profile_views": 0,  # TODO: Implement view tracking
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class PublicPortfolioView(APIView):
    """
    API view for public portfolio access.
    
    Allows viewing a user's public portfolio without authentication.
    """
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request: Request, username: str) -> Response:
        """Get public portfolio for a user."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            return Response(
                {"error": "Portfolio not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Get public data
        projects = Project.objects.filter(user=user, is_public=True)
        skills = Skill.objects.filter(user=user)
        experiences = Experience.objects.filter(user=user)
        social_links = SocialLink.objects.filter(user=user, is_visible=True)
        
        return Response({
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": getattr(user, "bio", ""),
                "title": getattr(user, "title", ""),
            },
            "projects": ProjectListSerializer(projects, many=True).data,
            "skills": SkillSerializer(skills, many=True).data,
            "experiences": ExperienceSerializer(experiences, many=True).data,
            "social_links": SocialLinkSerializer(social_links, many=True).data,
        })
