- use the following pattern for scripts in package.json
```
"scripts": {
    "tw": "tailwindcss -i src/tailwind.css -o src/tailwind-output.css",
    "tw:watch": "tailwindcss -i src/tailwind.css -o src/tailwind-output.css --watch",
    "start": "concurrently \"npm run tw:watch\" \"ng serve\"",
    "build": "npm run tw && ng build",
    "build:prod": "npm run tw && ng build --configuration=production",
    "build:native:android": "npm run tw && ng build --configuration=production && cap sync && cap open android",
    "build:native:ios": "npm run tw && ng build --configuration=production && cap sync && cap open ios",
    "lint": "ng lint",
    "test": "ng test",
    "cleanup": "ng generate @angular/core:cleanup-unused-imports"

}
```
