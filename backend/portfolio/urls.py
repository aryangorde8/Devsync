"""
URL configuration for the portfolio app.

This module defines the URL patterns for portfolio-related endpoints.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardStatsView,
    ExperienceViewSet,
    ProjectViewSet,
    PublicPortfolioView,
    SkillViewSet,
    SocialLinkViewSet,
)

app_name = "portfolio"

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"experiences", ExperienceViewSet, basename="experience")
router.register(r"social-links", SocialLinkViewSet, basename="social-link")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("public/<str:username>/", PublicPortfolioView.as_view(), name="public-portfolio"),
]
