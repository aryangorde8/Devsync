"""
Admin configuration for the portfolio app.
"""

from django.contrib import admin

from .models import Experience, Project, Skill, SocialLink


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin interface for Skill model."""
    
    list_display = ["name", "user", "category", "proficiency", "created_at"]
    list_filter = ["category", "created_at"]
    search_fields = ["name", "user__email"]
    ordering = ["-created_at"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model."""
    
    list_display = ["title", "user", "status", "is_featured", "is_public", "created_at"]
    list_filter = ["status", "is_featured", "is_public", "created_at"]
    search_fields = ["title", "description", "user__email"]
    prepopulated_fields = {"slug": ("title",)}
    ordering = ["-created_at"]
    filter_horizontal = ["skills"]


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    """Admin interface for Experience model."""
    
    list_display = ["position", "company", "user", "type", "is_current", "start_date"]
    list_filter = ["type", "is_current", "start_date"]
    search_fields = ["position", "company", "user__email"]
    ordering = ["-start_date"]
    filter_horizontal = ["skills"]


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    """Admin interface for SocialLink model."""
    
    list_display = ["platform", "user", "url", "is_visible"]
    list_filter = ["platform", "is_visible"]
    search_fields = ["user__email", "url"]
