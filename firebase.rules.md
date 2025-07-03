# Firebase Security Rules

## Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Teachers collection (admin only)
    match /teachers/{teacherId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    // Students collection (admin only for approve, self for update)
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true || request.auth.uid == studentId;
    }
    // Appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
``` 