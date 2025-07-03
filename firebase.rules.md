# Firebase Security Rules

## Firestore Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read and write all user data
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      // Teachers can read student data for appointments
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' &&
        resource.data.role == 'student';
      // Students can read teacher data
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student' &&
        resource.data.role == 'teacher';
    }

    // Appointments collection
    match /appointments/{appointmentId} {
      // Students can create appointments and read their own
      allow create: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student' &&
        request.resource.data.studentId == request.auth.uid;
      allow read: if request.auth != null &&
        (resource.data.studentId == request.auth.uid ||
         resource.data.teacherId == request.auth.uid);
      // Teachers can update appointments assigned to them
      allow update: if request.auth != null &&
        resource.data.teacherId == request.auth.uid &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      // Admins can read all appointments
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Availability subcollection
    match /availability/{teacherId}/slots/{slotId} {
      // Teachers can read/write their own slots
      allow read, write: if request.auth != null && request.auth.uid == teacherId;
      // Students can read teacher availability
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }

    // Messages (thread model)
    match /messages/{threadId} {
      // Teachers or students in the thread can read/write
      allow read, write: if request.auth != null &&
        (resource.data.teacherId == request.auth.uid || resource.data.studentId == request.auth.uid);
      // Admins can read all messages
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helpdesk collection (optional)
    match /helpdesk/{ticketId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow read, update: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
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