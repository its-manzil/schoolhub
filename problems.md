12:32:29.956 Running build in Washington, D.C., USA (East) – iad1
12:32:29.957 Build machine configuration: 2 cores, 8 GB
12:32:29.968 Cloning github.com/its-manzil/schoolhub (Branch: main, Commit: ac56598)
12:32:29.969 Skipping build cache, deployment was triggered without cache.
12:32:30.770 Cloning completed: 802.000ms
12:32:31.450 Running "vercel build"
12:32:32.105 Vercel CLI 50.42.0
12:32:32.706 Installing dependencies...
12:32:51.220 npm warn deprecated next@15.5.4: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
12:32:52.202 
12:32:52.202 added 530 packages in 19s
12:32:52.203 
12:32:52.203 149 packages are looking for funding
12:32:52.203   run `npm fund` for details
12:32:52.647 Detected Next.js version: 15.5.4
12:32:52.654 Running "npm run build"
12:32:52.769 
12:32:52.769 > schoolhub@0.1.0 build
12:32:52.770 > next build --turbopack
12:32:52.770 
12:32:53.446 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:32:53.447 This information is used to shape Next.js' roadmap and prioritize features.
12:32:53.447 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:32:53.447 https://nextjs.org/telemetry
12:32:53.448 
12:32:53.500    ▲ Next.js 15.5.4 (Turbopack)
12:32:53.501 
12:32:53.562    Creating an optimized production build ...
12:33:35.924  ✓ Finished writing to disk in 116ms
12:33:36.051  ✓ Compiled successfully in 42s
12:33:36.055    Linting and checking validity of types ...
12:33:49.524 
12:33:49.524 Failed to compile.
12:33:49.524 
12:33:49.524 ./app/Academic/Routine/page.tsx
12:33:49.525 208:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:33:49.525 216:6  Warning: React Hook useEffect has a missing dependency: 'fetchRoutine'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:33:49.525 
12:33:49.525 ./app/Academic/Subjects/page.tsx
12:33:49.525 70:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
12:33:49.526 103:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.526 174:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.526 217:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.526 264:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.526 381:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
12:33:49.537 381:36  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
12:33:49.538 
12:33:49.538 ./app/Accounting/Voucher/page.tsx
12:33:49.538 755:78  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.538 755:91  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.539 
12:33:49.539 ./app/Accounting/assets/add/page.tsx
12:33:49.539 23:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.550 
12:33:49.551 ./app/Accounting/reports/page.tsx
12:33:49.552 8:45  Warning: 'Printer' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.552 9:3  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.553 9:11  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.554 9:21  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.554 
12:33:49.554 ./app/Accounting/reports/report_view_template.tsx
12:33:49.554 6:42  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.555 6:50  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.555 6:60  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.555 6:68  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.556 6:79  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.559 12:13  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.560 83:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.560 
12:33:49.560 ./app/Accounting/tds/page-broken-backup.tsx
12:33:49.560 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.560 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.561 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.563 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.563 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.564 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.565 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.565 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.566 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.566 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.566 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.566 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.566 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.567 
12:33:49.567 ./app/Accounting/tds/page-broken.tsx
12:33:49.567 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.567 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.568 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.568 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.568 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.568 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.568 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.574 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.575 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.575 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.575 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.580 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.580 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.581 
12:33:49.581 ./app/Accounting/tds/page-dynamic-working.tsx
12:33:49.581 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.581 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.581 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.581 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.582 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.583 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.583 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.583 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.583 
12:33:49.583 ./app/Accounting/tds/page-old-hardcoded.tsx
12:33:49.583 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.584 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.585 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.585 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.585 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.585 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.585 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.586 
12:33:49.586 ./app/Accounting/tds/page-old.tsx
12:33:49.586 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.586 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.587 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.587 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.587 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.587 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.587 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.588 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.588 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.588 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.588 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
12:33:49.589 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.589 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.589 
12:33:49.590 ./app/Administrative/teacherapp/page.tsx
12:33:49.590 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.595 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.596 
12:33:49.596 ./app/SchoolAdmin/Components/Layout.tsx
12:33:49.596 7:16  Warning: 'LogOut' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.596 7:24  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.597 84:9  Warning: 'handleLogout' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.597 
12:33:49.597 ./app/SchoolAdmin/Student/AddStudentModal.tsx
12:33:49.597 9:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.598 
12:33:49.598 ./app/SchoolAdmin/Student/StudentDashboard.tsx
12:33:49.598 3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.598 4:64  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.598 57:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.599 
12:33:49.599 ./app/SchoolAdmin/Teachers/page.tsx
12:33:49.599 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
12:33:49.599 26:10  Warning: 'teachers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 27:10  Warning: 'loading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 29:10  Warning: 'error' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 30:10  Warning: 'selectedTeacher' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 31:10  Warning: 'showAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 173:9  Warning: 'handleDetailsClick' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.600 210:9  Warning: 'handleCloseDetails' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.601 218:9  Warning: 'handleCloseAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.601 222:9  Warning: 'getDefaultProfilePic' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.601 
12:33:49.601 ./app/SchoolAdmin/page.tsx
12:33:49.601 9:25  Warning: 'setLogoPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.601 48:11  Warning: 'handleInputChange' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.602 96:37  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:33:49.603 173:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:33:49.603 182:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:33:49.603 211:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:33:49.603 220:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
12:33:49.604 
12:33:49.604 ./app/SchoolAdmin/teacherapp/page.tsx
12:33:49.604 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.604 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
12:33:49.604 
12:33:49.604 ./app/api/accounting/coa/route.ts
12:33:49.605 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.605 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.605 
12:33:49.605 ./app/api/accounting/organization/route.ts
12:33:49.605 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.605 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.605 32:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.606 
12:33:49.606 ./app/api/accounting/tax/route.ts
12:33:49.606 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.606 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
12:33:49.607 
12:33:49.607 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
12:33:49.609 Error: Command "npm run build" exited with 1