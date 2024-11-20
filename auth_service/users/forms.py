from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, PasswordResetForm
from users.models import UserProfile

class LoginForm(AuthenticationForm):
	def confirm_login_allowed(self, UserProfile):
		pass

class RegisterForm(UserCreationForm):
	class Meta:
		model = UserProfile
		fields = ['username', 'email', 'password1', 'password2']
		widgets = {
			'username': forms.TextInput(attrs={'autocomplete': 'username'}),
			'email': forms.EmailInput(attrs={'autocomplete': 'email'}),
			'password1': forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
			'password2': forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
		}

class PasswordResetForm(PasswordResetForm):
	pass
