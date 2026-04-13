13:15:50.460 Running build in Washington, D.C., USA (East) – iad1
13:15:50.460 Build machine configuration: 2 cores, 8 GB
13:15:50.470 Cloning github.com/its-manzil/schoolhub (Branch: main, Commit: ac56598)
13:15:50.471 Skipping build cache, deployment was triggered without cache.
13:15:51.271 Cloning completed: 801.000ms
13:15:51.843 Running "vercel build"
13:15:52.489 Vercel CLI 50.42.0
13:15:52.891 Installing dependencies...
13:16:09.940 npm warn deprecated next@15.5.4: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
13:16:10.931 
13:16:10.932 added 530 packages in 18s
13:16:10.932 
13:16:10.933 149 packages are looking for funding
13:16:10.933   run `npm fund` for details
13:16:11.229 Detected Next.js version: 15.5.4
13:16:11.235 Running "npm run build"
13:16:11.831 
13:16:11.832 > schoolhub@0.1.0 build
13:16:11.832 > next build --turbopack
13:16:11.832 
13:16:13.150 Attention: Next.js now collects completely anonymous telemetry regarding usage.
13:16:13.150 This information is used to shape Next.js' roadmap and prioritize features.
13:16:13.155 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
13:16:13.156 https://nextjs.org/telemetry
13:16:13.156 
13:16:13.274    ▲ Next.js 15.5.4 (Turbopack)
13:16:13.274 
13:16:13.333    Creating an optimized production build ...
13:16:51.525  ✓ Finished writing to disk in 98ms
13:16:51.688  ✓ Compiled successfully in 37.9s
13:16:51.688    Linting and checking validity of types ...
13:17:04.225 
13:17:04.226 Failed to compile.
13:17:04.226 
13:17:04.226 ./app/Academic/Routine/page.tsx
13:17:04.227 208:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
13:17:04.227 216:6  Warning: React Hook useEffect has a missing dependency: 'fetchRoutine'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
13:17:04.227 
13:17:04.227 ./app/Academic/Subjects/page.tsx
13:17:04.227 70:6  Warning: React Hook useEffect has a missing dependency: 'fetchSubjects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
13:17:04.227 103:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.228 174:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.228 217:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.228 264:14  Warning: 'err' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.228 381:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
13:17:04.228 381:36  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
13:17:04.228 
13:17:04.228 ./app/Accounting/Voucher/page.tsx
13:17:04.229 755:78  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.229 755:91  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.229 
13:17:04.229 ./app/Accounting/assets/add/page.tsx
13:17:04.229 23:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.229 
13:17:04.229 ./app/Accounting/reports/page.tsx
13:17:04.229 8:45  Warning: 'Printer' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.229 9:3  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.229 9:11  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 9:21  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 
13:17:04.230 ./app/Accounting/reports/report_view_template.tsx
13:17:04.230 6:42  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 6:50  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 6:60  Warning: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 6:68  Warning: 'RefreshCw' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 6:79  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.230 12:13  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.231 83:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.231 
13:17:04.231 ./app/Accounting/tds/page-broken-backup.tsx
13:17:04.231 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.231 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.231 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.231 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.231 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.232 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.232 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 
13:17:04.233 ./app/Accounting/tds/page-broken.tsx
13:17:04.233 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.233 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.234 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.234 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.239 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.240 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.240 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.240 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.240 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.240 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.240 
13:17:04.240 ./app/Accounting/tds/page-dynamic-working.tsx
13:17:04.241 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.241 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.242 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.242 
13:17:04.243 ./app/Accounting/tds/page-old-hardcoded.tsx
13:17:04.243 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.243 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.261 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.261 
13:17:04.261 ./app/Accounting/tds/page-old.tsx
13:17:04.262 125:7  Warning: 'BackBtn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.262 132:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.262 258:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.262 258:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.262 371:25  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.262 371:33  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.263 452:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.263 452:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.263 531:28  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.263 531:36  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.263 553:167  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
13:17:04.264 611:23  Warning: 'onBack' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.264 611:31  Warning: 'onNavigate' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.264 
13:17:04.264 ./app/Administrative/teacherapp/page.tsx
13:17:04.264 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 
13:17:04.265 ./app/SchoolAdmin/Components/Layout.tsx
13:17:04.265 7:16  Warning: 'LogOut' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 7:24  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 84:9  Warning: 'handleLogout' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 
13:17:04.265 ./app/SchoolAdmin/Student/AddStudentModal.tsx
13:17:04.265 9:20  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.265 
13:17:04.265 ./app/SchoolAdmin/Student/StudentDashboard.tsx
13:17:04.265 3:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 4:64  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 57:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.265 
13:17:04.265 ./app/SchoolAdmin/Teachers/page.tsx
13:17:04.265 4:8  Warning: 'Image' is defined but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 26:10  Warning: 'teachers' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 27:10  Warning: 'loading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 29:10  Warning: 'error' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 30:10  Warning: 'selectedTeacher' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 31:10  Warning: 'showAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 173:9  Warning: 'handleDetailsClick' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 210:9  Warning: 'handleCloseDetails' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 218:9  Warning: 'handleCloseAddForm' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 222:9  Warning: 'getDefaultProfilePic' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 
13:17:04.265 ./app/SchoolAdmin/page.tsx
13:17:04.265 9:25  Warning: 'setLogoPreview' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.265 48:11  Warning: 'handleInputChange' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.266 96:37  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
13:17:04.266 173:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
13:17:04.266 182:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
13:17:04.266 211:49  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
13:17:04.266 220:53  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
13:17:04.266 
13:17:04.266 ./app/SchoolAdmin/teacherapp/page.tsx
13:17:04.266 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.266 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:17:04.266 
13:17:04.266 ./app/api/accounting/coa/route.ts
13:17:04.266 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.266 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.266 
13:17:04.272 ./app/api/accounting/organization/route.ts
13:17:04.274 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.274 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.274 32:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.274 
13:17:04.275 ./app/api/accounting/tax/route.ts
13:17:04.275 10:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.275 21:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
13:17:04.275 
13:17:04.275 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
13:17:04.304 Error: Command "npm run build" exited with 1