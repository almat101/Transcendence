# views.py (Django)
from django.http import Http404

def catch_all(request, invalid_path=None):
    raise Http404("Page not found")
