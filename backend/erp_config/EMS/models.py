# backend/erp_config/EMS/models.py (Corrected for Circular Import)

from django.db import models
from django.conf import settings

# --- Define Choices First ---
class EmployeeStatus(models.TextChoices):
    ACTIVE = 'Active', 'Active'
    INACTIVE = 'Inactive', 'Inactive'
    ON_LEAVE = 'On Leave', 'On Leave'
    PROBATION = 'Probation', 'Probation'
    TERMINATED = 'Terminated', 'Terminated'

class EmploymentType(models.TextChoices):
    FULL_TIME = 'Full-time', 'Full-time'
    PART_TIME = 'Part-time', 'Part-time'
    CONTRACT = 'Contract', 'Contract'
    INTERN = 'Intern', 'Intern'

class Gender(models.TextChoices):
    MALE = 'Male', 'Male'
    FEMALE = 'Female', 'Female'
    OTHER = 'Other', 'Other'
    PREFER_NOT_TO_SAY = 'Prefer Not To Say', 'Prefer Not To Say'

class MaritalStatus(models.TextChoices):
    SINGLE = 'Single', 'Single'
    MARRIED = 'Married', 'Married'
    DIVORCED = 'Divorced', 'Divorced'
    WIDOWED = 'Widowed', 'Widowed'
    OTHER = 'Other', 'Other'

# --- Define Department Model ---
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

# --- Define Employee Model ---
class Employee(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='employee_profile',
        null=True, blank=True
    )
    employee_id = models.CharField(max_length=20, unique=True, blank=False, null=False)
    mobile_phone = models.CharField(max_length=15, blank=True, null=True)

    # --- Use STRING reference for ForeignKey within same file ---
    department = models.ForeignKey(
        'Department', # <-- Use string 'Department' here
        on_delete=models.SET_NULL,
        related_name='employees',
        null=True, blank=True
    )
    # ----------------------------------------------------------
    job_title = models.CharField(max_length=100, blank=True, null=True) # Keep as CharField for now
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    date_joined = models.DateField(blank=False, null=False)
    employee_status = models.CharField(max_length=20, choices=EmployeeStatus.choices, default=EmployeeStatus.PROBATION)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MaritalStatus.choices, null=True, blank=True)
    home_address = models.TextField(null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    # pin_code = models.CharField(max_length=10, blank=True, null=True) # PIN code still commented out

    date_created = models.DateTimeField(auto_now_add=True) # Assuming field names from user code
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name() or self.user.username if self.user else '(No User Linked)'}"

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['employee_id']

# EmergencyContact model should NOT be here based on user revert