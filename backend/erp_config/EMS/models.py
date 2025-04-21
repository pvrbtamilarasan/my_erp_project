# C:\scripts\my_app\my_erp_project\backend\erp_config\EMS\models.py

from django.db import models
from django.conf import settings # To link to the built-in User model

# Define choices for fields that have specific options
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

# --- Add choices for new fields ---
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

# Create your Employee model here
class Employee(models.Model):
    # Link to the built-in Django User model (for login, etc.)
    # settings.AUTH_USER_MODEL refers to the default User model
    # OneToOneField ensures one Employee profile per User account
    # models.CASCADE means if the User is deleted, the Employee profile is also deleted
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Changed from CASCADE to SET_NULL 
        related_name='employee_profile', # Helps access Employee from User object
        null=True, # Allow null in database
        blank=True # Allow empty in forms/admin
    )

    # Basic identification
    employee_id = models.CharField(max_length=20, unique=True, blank=False, null=False)
    # first_name, last_name, email are usually stored in the User model itself
    # We can add them here if needed, or access them via the 'user' relationship

    # Contact
    mobile_phone = models.CharField(max_length=15, blank=True, null=True) # Optional

    # Employment Details
    department = models.CharField(max_length=100, blank=True, null=True) # Optional for now
    job_title = models.CharField(max_length=100, blank=True, null=True) # Optional for now
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME # Default to Full-time
    )
    date_joined = models.DateField(blank=False, null=False)
    employee_status = models.CharField(
        max_length=20,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.PROBATION # Default to Probation or Active
    )
# --- Add the new optional ImageField ---
    profile_picture = models.ImageField(
        upload_to='profile_pics/', # Subdirectory within MEDIA_ROOT
        null=True,                 # Allow NULL in database
        blank=True                 # Allow empty in forms/admin
    )
     # --- New Personal Information Fields ---
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20, choices=Gender.choices,
        null=True, blank=True
    )
    marital_status = models.CharField(
        max_length=20, choices=MaritalStatus.choices,
        null=True, blank=True
    )
    # Simple address field for now, can be expanded to related model later
    home_address = models.TextField(null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    # ------------------------------------
    # Optional: Add date_created and date_updated fields
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Returns a readable representation of the object, uses username from linked User model
        #return f"{self.employee_id} - {self.user.get_full_name() or self.user.username}"
        return f"{self.employee_id} - {self.user.get_full_name() or self.user.username if self.user else '(No User Linked)'}" # Updated for optional user

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        #ordering = ['user__last_name', 'user__first_name'] # Order by user's last name, then first name
        ordering = ['employee_id']