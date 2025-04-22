# backend/erp_config/EMS/serializers.py (Corrected Timestamp Field Names)

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department

# User Serializer (if needed)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active']
        read_only_fields = ['id', 'is_active']

# Department Serializer (Correct)
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description'] # Keep fields simple for nesting
        read_only_fields = ['id']

# Employee Serializer - With Corrected Timestamp Names
class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True, required=False, allow_null=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True,
        required=False, allow_null=True
    )
    # Nested Department Serializer for reading
    department = DepartmentSerializer(read_only=True, required=False, allow_null=True)
    # PrimaryKeyRelatedField for writing department ID
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True,
        required=False, allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'user',
            'user_id',
            'department', # Read-only nested object
            'department_id', # Write-only ID field
            'mobile_phone',
            'job_title',
            'employment_type',
            'date_joined',
            'employee_status',
            'profile_picture',
            'date_of_birth',
            'gender',
            'marital_status',
            'home_address',
            # 'pin_code', # Still omitted
            'nationality',
            # 'emergency_contacts', # Still omitted
            'date_created', # <-- Corrected Name
            'date_updated', # <-- Corrected Name
        ]
        read_only_fields = [
            'id',
            'user',
            'department', # Nested object is read-only
            'date_created', # <-- Corrected Name
            'date_updated', # <-- Corrected Name
        ]