from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """Anyone can browse the catalogue; only staff can add, change or delete."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)


class IsAdminOrCreateOnly(BasePermission):
    """Anyone can read and post (e.g. reviews); only staff can edit or delete."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.method == "POST":
            return True
        return bool(request.user and request.user.is_staff)
