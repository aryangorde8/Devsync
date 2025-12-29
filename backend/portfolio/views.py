"""
Views for the portfolio app.

This module provides API views for projects, skills,
analytics, and other portfolio-related endpoints.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Certification,
    ContactMessage,
    Education,
    Experience,
    PortfolioTheme,
    ProfileView,
    Project,
    ProjectView,
    Skill,
    SocialLink,
)
from .serializers import (
    AnalyticsSerializer,
    CertificationSerializer,
    ContactMessageCreateSerializer,
    ContactMessageSerializer,
    DashboardStatsSerializer,
    EducationSerializer,
    ExperienceSerializer,
    PortfolioThemeSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)

User = get_user_model()


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Project CRUD operations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        return ProjectDetailSerializer
    
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).prefetch_related("skills")
    
    @action(detail=False, methods=["get"])
    def featured(self, request: Request) -> Response:
        projects = self.get_queryset().filter(is_featured=True)[:6]
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def toggle_featured(self, request: Request, pk=None) -> Response:
        project = self.get_object()
        project.is_featured = not project.is_featured
        project.save()
        return Response({"is_featured": project.is_featured})


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for Skill CRUD operations."""
    
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=["get"])
    def by_category(self, request: Request) -> Response:
        skills = self.get_queryset()
        grouped = {}
        for skill in skills:
            category = skill.get_category_display()
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(SkillSerializer(skill).data)
        return Response(grouped)


class ExperienceViewSet(viewsets.ModelViewSet):
    """ViewSet for Experience CRUD operations."""
    
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user).prefetch_related("skills")


class SocialLinkViewSet(viewsets.ModelViewSet):
    """ViewSet for SocialLink CRUD operations."""
    
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SocialLink.objects.filter(user=self.request.user)


class EducationViewSet(viewsets.ModelViewSet):
    """ViewSet for Education CRUD operations."""
    
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)


class CertificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Certification CRUD operations."""
    
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)


class ContactMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Contact Message management."""
    
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ContactMessage.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=["post"])
    def mark_read(self, request: Request, pk=None) -> Response:
        message = self.get_object()
        message.status = ContactMessage.Status.READ
        message.save()
        return Response({"status": "read"})
    
    @action(detail=True, methods=["post"])
    def toggle_starred(self, request: Request, pk=None) -> Response:
        message = self.get_object()
        message.is_starred = not message.is_starred
        message.save()
        return Response({"is_starred": message.is_starred})
    
    @action(detail=True, methods=["post"])
    def archive(self, request: Request, pk=None) -> Response:
        message = self.get_object()
        message.status = ContactMessage.Status.ARCHIVED
        message.save()
        return Response({"status": "archived"})
    
    @action(detail=False, methods=["get"])
    def unread_count(self, request: Request) -> Response:
        count = self.get_queryset().filter(status=ContactMessage.Status.UNREAD).count()
        return Response({"unread_count": count})


class PortfolioThemeView(APIView):
    """API view for portfolio theme management."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        theme, created = PortfolioTheme.objects.get_or_create(user=request.user)
        serializer = PortfolioThemeSerializer(theme)
        return Response(serializer.data)
    
    def put(self, request: Request) -> Response:
        theme, created = PortfolioTheme.objects.get_or_create(user=request.user)
        serializer = PortfolioThemeSerializer(theme, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    """API view for dashboard statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        user = request.user
        
        projects = Project.objects.filter(user=user)
        messages = ContactMessage.objects.filter(recipient=user)
        
        stats = {
            "total_projects": projects.count(),
            "completed_projects": projects.filter(status="completed").count(),
            "in_progress_projects": projects.filter(status="in_progress").count(),
            "total_skills": Skill.objects.filter(user=user).count(),
            "total_experiences": Experience.objects.filter(user=user).count(),
            "profile_views": ProfileView.objects.filter(user=user).count(),
            "total_messages": messages.count(),
            "unread_messages": messages.filter(status=ContactMessage.Status.UNREAD).count(),
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


class AnalyticsView(APIView):
    """API view for detailed analytics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        user = request.user
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        profile_views = ProfileView.objects.filter(user=user)
        project_views = ProjectView.objects.filter(project__user=user)
        
        # Views by day for the last 30 days
        views_by_day = []
        for i in range(30):
            day = today - timedelta(days=i)
            count = profile_views.filter(viewed_at__date=day).count()
            count += project_views.filter(viewed_at__date=day).count()
            views_by_day.append({"date": day.isoformat(), "views": count})
        
        # Top projects by views
        top_projects = (
            Project.objects.filter(user=user)
            .annotate(view_count=Count("views"))
            .order_by("-view_count")[:5]
            .values("id", "title", "view_count")
        )
        
        # Referrers
        referrers = (
            profile_views.exclude(referrer="")
            .values("referrer")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        
        # Device breakdown
        device_counts = profile_views.values("device_type").annotate(count=Count("id"))
        devices = {d["device_type"] or "unknown": d["count"] for d in device_counts}
        
        analytics = {
            "total_profile_views": profile_views.count(),
            "total_project_views": project_views.count(),
            "views_today": profile_views.filter(viewed_at__date=today).count(),
            "views_this_week": profile_views.filter(viewed_at__gte=week_ago).count(),
            "views_this_month": profile_views.filter(viewed_at__gte=month_ago).count(),
            "top_projects": list(top_projects),
            "views_by_day": list(reversed(views_by_day)),
            "referrers": list(referrers),
            "devices": devices,
        }
        
        serializer = AnalyticsSerializer(analytics)
        return Response(serializer.data)


class PublicPortfolioView(APIView):
    """API view for public portfolio access."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request: Request, username: str) -> Response:
        # Try to find user by username/email or by a custom slug
        try:
            # First try exact email match
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            # Try to find by username part of email
            try:
                user = User.objects.get(email__istartswith=f"{username}@")
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                return Response(
                    {"error": "Portfolio not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        # Track the view
        self._track_view(request, user)
        
        # Get theme
        theme = None
        try:
            theme = user.portfolio_theme
        except PortfolioTheme.DoesNotExist:
            pass
        
        # Get public data
        projects = Project.objects.filter(user=user, is_public=True)
        skills = Skill.objects.filter(user=user)
        experiences = Experience.objects.filter(user=user)
        education = Education.objects.filter(user=user)
        certifications = Certification.objects.filter(user=user)
        social_links = SocialLink.objects.filter(user=user, is_visible=True)
        
        return Response({
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.get_full_name() or user.email.split("@")[0],
                "bio": getattr(user, "bio", "") or "",
                "title": getattr(user, "title", "") or "",
                "avatar": user.avatar.url if user.avatar else None,
            },
            "theme": PortfolioThemeSerializer(theme).data if theme else None,
            "projects": ProjectListSerializer(projects, many=True).data,
            "skills": SkillSerializer(skills, many=True).data,
            "experiences": ExperienceSerializer(experiences, many=True).data,
            "education": EducationSerializer(education, many=True).data,
            "certifications": CertificationSerializer(certifications, many=True).data,
            "social_links": SocialLinkSerializer(social_links, many=True).data,
        })
    
    def _track_view(self, request: Request, user) -> None:
        """Track portfolio view."""
        # Get client info
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        referrer = request.META.get("HTTP_REFERER", "")
        
        # Determine device type
        device_type = "desktop"
        ua_lower = user_agent.lower()
        if "mobile" in ua_lower or "android" in ua_lower:
            device_type = "mobile"
        elif "tablet" in ua_lower or "ipad" in ua_lower:
            device_type = "tablet"
        
        ProfileView.objects.create(
            user=user,
            visitor_ip=ip,
            visitor_user_agent=user_agent[:500],
            referrer=referrer[:200] if referrer else "",
            device_type=device_type,
        )


class PublicContactView(APIView):
    """API view for public contact form submission."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request: Request, username: str) -> Response:
        # Find user
        try:
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email__istartswith=f"{username}@")
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                return Response(
                    {"error": "Portfolio not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        # Check if contact form is enabled
        try:
            theme = user.portfolio_theme
            if not theme.show_contact_form:
                return Response(
                    {"error": "Contact form is disabled"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except PortfolioTheme.DoesNotExist:
            pass
        
        serializer = ContactMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recipient=user)
            return Response(
                {"message": "Your message has been sent successfully!"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicProjectView(APIView):
    """API view for viewing a single public project."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request: Request, username: str, slug: str) -> Response:
        # Find user
        try:
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email__istartswith=f"{username}@")
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                return Response(
                    {"error": "Portfolio not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        # Get project
        try:
            project = Project.objects.get(user=user, slug=slug, is_public=True)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Track view
        self._track_view(request, project)
        
        return Response(ProjectDetailSerializer(project).data)
    
    def _track_view(self, request: Request, project: Project) -> None:
        """Track project view."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        
        ProjectView.objects.create(
            project=project,
            visitor_ip=ip,
            visitor_user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            referrer=request.META.get("HTTP_REFERER", "")[:200],
        )


class GitHubImportView(APIView):
    """API view for importing projects from GitHub."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request: Request) -> Response:
        """Import repositories from GitHub."""
        github_username = request.data.get("github_username")
        if not github_username:
            # Try to get from user profile
            github_username = getattr(request.user, "github_username", None)
        
        if not github_username:
            return Response(
                {"error": "GitHub username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        import requests as http_requests
        
        try:
            # Fetch repos from GitHub API
            response = http_requests.get(
                f"https://api.github.com/users/{github_username}/repos",
                params={"sort": "updated", "per_page": 30},
                headers={"Accept": "application/vnd.github.v3+json"},
                timeout=10,
            )
            response.raise_for_status()
            repos = response.json()
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch GitHub repos: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        
        imported = []
        skipped = []
        
        for repo in repos:
            if repo.get("fork"):
                continue
            
            # Check if already exists
            if Project.objects.filter(
                user=request.user,
                github_url=repo["html_url"]
            ).exists():
                skipped.append(repo["name"])
                continue
            
            # Detect technologies from language
            technologies = []
            if repo.get("language"):
                technologies.append(repo["language"])
            
            # Create project
            project = Project.objects.create(
                user=request.user,
                title=repo["name"].replace("-", " ").replace("_", " ").title(),
                description=repo.get("description") or f"A {repo.get('language', '')} project.",
                short_description=(repo.get("description") or "")[:300],
                github_url=repo["html_url"],
                live_url=repo.get("homepage") or "",
                technologies=technologies,
                status="completed" if not repo.get("archived") else "archived",
                is_public=not repo.get("private", False),
            )
            imported.append(project.title)
        
        return Response({
            "message": f"Imported {len(imported)} projects",
            "imported": imported,
            "skipped": skipped,
        })


class ResumeDataView(APIView):
    """API view for getting resume/CV data."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        """Get all data needed to generate a resume."""
        user = request.user
        
        return Response({
            "personal": {
                "name": user.get_full_name() or user.email.split("@")[0],
                "email": user.email,
                "title": getattr(user, "title", "") or "",
                "bio": getattr(user, "bio", "") or "",
                "github": getattr(user, "github_username", "") or "",
                "linkedin": getattr(user, "linkedin_url", "") or "",
                "portfolio": getattr(user, "portfolio_url", "") or "",
            },
            "skills": SkillSerializer(
                Skill.objects.filter(user=user), many=True
            ).data,
            "experience": ExperienceSerializer(
                Experience.objects.filter(user=user), many=True
            ).data,
            "education": EducationSerializer(
                Education.objects.filter(user=user), many=True
            ).data,
            "certifications": CertificationSerializer(
                Certification.objects.filter(user=user), many=True
            ).data,
            "projects": ProjectListSerializer(
                Project.objects.filter(user=user, is_public=True)[:5], many=True
            ).data,
        })


class ResumeDownloadView(APIView):
    """API view for downloading resume as PDF."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> HttpResponse:
        """Generate and download PDF resume."""
        from .pdf_generator import generate_resume_pdf
        
        user = request.user
        
        # Gather all user data
        user_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "title": getattr(user, "title", ""),
            "bio": getattr(user, "bio", ""),
            "github_username": getattr(user, "github_username", ""),
            "linkedin_url": getattr(user, "linkedin_url", ""),
            "portfolio_url": getattr(user, "portfolio_url", ""),
            "skills": SkillSerializer(
                Skill.objects.filter(user=user), many=True
            ).data,
            "experiences": ExperienceSerializer(
                Experience.objects.filter(user=user).order_by("-start_date"), many=True
            ).data,
            "education": EducationSerializer(
                Education.objects.filter(user=user).order_by("-start_date"), many=True
            ).data,
            "certifications": CertificationSerializer(
                Certification.objects.filter(user=user).order_by("-issue_date"), many=True
            ).data,
            "projects": ProjectDetailSerializer(
                Project.objects.filter(user=user, is_public=True).order_by("-is_featured", "-created_at")[:5],
                many=True
            ).data,
        }
        
        # Generate PDF
        pdf_bytes = generate_resume_pdf(user_data)
        
        # Create response
        filename = f"{user.first_name or 'resume'}_{user.last_name or 'cv'}.pdf".replace(" ", "_")
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        
        return response


class ExportDataView(APIView):
    """API view for exporting all user data as JSON."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request: Request) -> Response:
        """Export all user portfolio data."""
        user = request.user
        
        data = {
            "exported_at": timezone.now().isoformat(),
            "profile": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "title": getattr(user, "title", ""),
                "bio": getattr(user, "bio", ""),
                "github_username": getattr(user, "github_username", ""),
                "linkedin_url": getattr(user, "linkedin_url", ""),
                "portfolio_url": getattr(user, "portfolio_url", ""),
            },
            "projects": ProjectDetailSerializer(
                Project.objects.filter(user=user), many=True
            ).data,
            "skills": SkillSerializer(
                Skill.objects.filter(user=user), many=True
            ).data,
            "experiences": ExperienceSerializer(
                Experience.objects.filter(user=user), many=True
            ).data,
            "education": EducationSerializer(
                Education.objects.filter(user=user), many=True
            ).data,
            "certifications": CertificationSerializer(
                Certification.objects.filter(user=user), many=True
            ).data,
            "social_links": SocialLinkSerializer(
                SocialLink.objects.filter(user=user), many=True
            ).data,
            "theme": PortfolioThemeSerializer(
                PortfolioTheme.objects.filter(user=user).first()
            ).data if PortfolioTheme.objects.filter(user=user).exists() else None,
        }
        
        return Response(data)
