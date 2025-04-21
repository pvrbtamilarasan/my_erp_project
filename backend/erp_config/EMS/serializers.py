# C:\scripts\my_app\my_erp_project\backend\erp_config\EMS\serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model # To get the User model
from .models import Employee # Import the Employee model we created

# Get the User model configured in settings (usually django.contrib.auth.models.User)
User = get_user_model()

# Optional: A simple serializer just for displaying related User info concisely
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email'] # Fields from User model to show

# Main serializer for the Employee model
class EmployeeSerializer(serializers.ModelSerializer):
    # Display related User info using the nested serializer (read-only)
    # Alternatively, could use StringRelatedField or just show the user ID
    user = UserSerializer(read_only=True)

    # Make related user ID writeable for creating/linking employees,
    # but don't show it in the main representation (it's nested in 'user' above)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Employee # Specify the model the serializer is for
        # List the fields from the Employee model to include in the API representation
        fields = [
            'id',                     # Employee model's own primary key
            'employee_id',
            'user',                   # Read-only nested object (can be null)
            'user_id',                # Write-only, optional ID
            'mobile_phone',
            'department',
            'job_title',
            'employment_type',
            'date_joined',
            'employee_status',
            'profile_picture', 
            'date_of_birth',
            'gender',
            'marital_status',
            'home_address',
            'nationality',
            'date_created',
            'date_updated',
        ]
        # Specify fields that should be read-only in the API
        read_only_fields = [
            'id',
            'date_created',
            'date_updated',
            # 'user' is read-only by default because we used UserSerializer(read_only=True)
        ]

    # Optional: Add validation if needed, e.g., validate_employee_id
    # def validate_employee_id(self, value):
    #     if not value.startswith('EMP'):
    #         raise serializers.ValidationError("Employee ID must start with 'EMP'.")
    #     return value