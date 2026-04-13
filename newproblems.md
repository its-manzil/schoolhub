12:43:15.445 Running build in Washington, D.C., USA (East) – iad1
12:43:15.446 Build machine configuration: 2 cores, 8 GB
12:43:15.456 Cloning github.com/its-manzil/schoolhub (Branch: main, Commit: ac56598)
12:43:15.457 Skipping build cache, deployment was triggered without cache.
12:43:16.561 Cloning completed: 1.105s
12:43:17.127 Running "vercel build"
12:43:17.795 Vercel CLI 50.42.0
12:43:18.182 Installing dependencies...
12:43:35.397 npm warn deprecated next@15.5.4: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
12:43:36.483 
12:43:36.484 added 530 packages in 18s
12:43:36.484 
12:43:36.485 149 packages are looking for funding
12:43:36.485   run `npm fund` for details
12:43:36.944 Detected Next.js version: 15.5.4
12:43:36.951 Running "npm run build"
12:43:37.486 
12:43:37.487 > schoolhub@0.1.0 build
12:43:37.487 > next build --turbopack
12:43:37.487 
12:43:38.431 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:43:38.432 This information is used to shape Next.js' roadmap and prioritize features.
12:43:38.432 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:43:38.432 https://nextjs.org/telemetry
12:43:38.433 
12:43:38.650    ▲ Next.js 15.5.4 (Turbopack)
12:43:38.651 
12:43:38.725    Creating an optimized production build ...
12:44:20.166  ✓ Finished writing to disk in 121ms
12:44:20.303  ✓ Compiled successfully in 41s
12:44:20.305    Linting and checking validity of types ...
12:44:33.010 
12:44:33.010 Failed to compile.
12:44:33.010 
12:44:33.010 ./app/Academic/Routine/page.tsx
12:44:33.010 208:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:44:33.010 216:6  Warning: React Hook useEffect has a missing dependency: 'fetchRoutine'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:44:33.011 
12:44:33.011 ./app/Academic/Subjects/page.tsx
12:44:33.011 70:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:44:33.011 103:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.011 174:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.011 217:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.011 264:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.011 381:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
12:44:33.011 381:36  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
12:44:33.011 
12:44:33.012 ./app/Accounting/Voucher/page.tsx
12:44:33.012 755:78  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.012 755:91  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.012 
12:44:33.012 ./app/Accounting/assets/add/page.tsx
12:44:33.012 23:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.012 
12:44:33.012 ./app/Accounting/reports/page.tsx
12:44:33.012 8:45  Warning: 'Printer' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 9:3  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 9:11  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 9:21  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 
12:44:33.013 ./app/Accounting/reports/report_view_template.tsx
12:44:33.013 6:42  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 6:50  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 6:60  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 6:68  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.013 6:79  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.014 12:13  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.014 83:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.014 
12:44:33.014 ./app/Accounting/tds/page-broken-backup.tsx
12:44:33.014 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.014 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.014 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.017 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 
12:44:33.017 ./app/Accounting/tds/page-broken.tsx
12:44:33.017 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.017 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.018 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.018 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.019 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.019 
12:44:33.019 ./app/Accounting/tds/page-dynamic-working.tsx
12:44:33.019 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.019 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.019 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.020 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.022 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.022 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.022 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.022 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.022 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.023 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.023 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.023 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.023 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.023 
12:44:33.023 ./app/Accounting/tds/page-old-hardcoded.tsx
12:44:33.023 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.023 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.024 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.025 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.025 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.025 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.025 
12:44:33.025 ./app/Accounting/tds/page-old.tsx
12:44:33.025 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.026 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.027 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.027 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.027 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.027 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.028 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.030 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.030 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.030 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.030 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:44:33.031 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.031 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.031 
12:44:33.031 ./app/Administrative/teacherapp/page.tsx
12:44:33.032 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.032 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.032 
12:44:33.032 ./app/SchoolAdmin/Components/Layout.tsx
12:44:33.032 7:16  Warning: 'LogOut' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.032 7:24  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.032 84:9  Warning: 'handleLogout' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.032 
12:44:33.034 ./app/SchoolAdmin/Student/AddStudentModal.tsx
12:44:33.034 9:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.034 
12:44:33.034 ./app/SchoolAdmin/Student/StudentDashboard.tsx
12:44:33.034 3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.034 4:64  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.034 57:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.034 
12:44:33.034 ./app/SchoolAdmin/Teachers/page.tsx
12:44:33.035 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 26:10  Warning: 'teachers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 27:10  Warning: 'loading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 29:10  Warning: 'error' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 30:10  Warning: 'selectedTeacher' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 31:10  Warning: 'showAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 173:9  Warning: 'handleDetailsClick' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 210:9  Warning: 'handleCloseDetails' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 218:9  Warning: 'handleCloseAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.035 222:9  Warning: 'getDefaultProfilePic' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.036 
12:44:33.039 ./app/SchoolAdmin/page.tsx
12:44:33.039 9:25  Warning: 'setLogoPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.039 48:11  Warning: 'handleInputChange' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.039 96:37  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:44:33.039 173:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:44:33.039 182:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:44:33.039 211:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:44:33.040 220:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:44:33.040 
12:44:33.041 ./app/SchoolAdmin/teacherapp/page.tsx
12:44:33.041 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.041 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:44:33.041 
12:44:33.041 ./app/api/accounting/coa/route.ts
12:44:33.041 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 
12:44:33.041 ./app/api/accounting/organization/route.ts
12:44:33.041 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 32:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 
12:44:33.041 ./app/api/accounting/tax/route.ts
12:44:33.041 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.041 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:44:33.042 
12:44:33.042 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
12:44:33.042 Error: Command "npm run build" exited with 1