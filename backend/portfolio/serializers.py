"""
Serializers for the portfolio app.

This module provides serializers for projects, skills,
and other portfolio-related models.
"""

from rest_framework import serializers

from .models import Experience, Project, Skill, SocialLink


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model."""
    
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )
    
    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "category",
            "category_display",
            "proficiency",
            "years_experience",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def create(self, validated_data):
        """Create skill with current user."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer for listing projects (minimal data)."""
    
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "status",
            "status_display",
            "technologies",
            "github_url",
            "live_url",
            "featured_image",
            "is_featured",
            "is_public",
            "created_at",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Serializer for project details (full data)."""
    
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="skills",
    )
    
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "short_description",
            "status",
            "status_display",
            "github_url",
            "live_url",
            "demo_url",
            "featured_image",
            "skills",
            "skill_ids",
            "technologies",
            "is_featured",
            "is_public",
            "order",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
    
    def create(self, validated_data):
        """Create project with current user."""
        skills = validated_data.pop("skills", [])
        validated_data["user"] = self.context["request"].user
        project = super().create(validated_data)
        if skills:
            project.skills.set(skills)
        return project
    
    def update(self, instance, validated_data):
        """Update project with skills handling."""
        skills = validated_data.pop("skills", None)
        project = super().update(instance, validated_data)
        if skills is not None:
            project.skills.set(skills)
        return project


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for Experience model."""
    
    type_display = serializers.CharField(
        source="get_type_display",
        read_only=True,
    )
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="skills",
    )
    
    class Meta:
        model = Experience
        fields = [
            "id",
            "company",
            "position",
            "type",
            "type_display",
            "location",
            "description",
            "start_date",
            "end_date",
            "is_current",
            "skills",
            "skill_ids",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def create(self, validated_data):
        """Create experience with current user."""
        skills = validated_data.pop("skills", [])
        validated_data["user"] = self.context["request"].user
        experience = super().create(validated_data)
        if skills:
            experience.skills.set(skills)
        return experience
    
    def update(self, instance, validated_data):
        """Update experience with skills handling."""
        skills = validated_data.pop("skills", None)
        experience = super().update(instance, validated_data)
        if skills is not None:
            experience.skills.set(skills)
        return experience


class SocialLinkSerializer(serializers.ModelSerializer):
    """Serializer for SocialLink model."""
    
    platform_display = serializers.CharField(
        source="get_platform_display",
        read_only=True,
    )
    
    class Meta:
        model = SocialLink
        fields = [
            "id",
            "platform",
            "platform_display",
            "url",
            "is_visible",
        ]
    
    def create(self, validated_data):
        """Create social link with current user."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    total_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    in_progress_projects = serializers.IntegerField()
    total_skills = serializers.IntegerField()
    total_experiences = serializers.IntegerField()
    profile_views = serializers.IntegerField()
