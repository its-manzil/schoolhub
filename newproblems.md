13:49:44.980 Running build in Washington, D.C., USA (East) – iad1
13:49:44.981 Build machine configuration: 2 cores, 8 GB
13:49:45.095 Cloning github.com/its-manzil/schoolhub (Branch: main, Commit: c20000e)
13:49:45.096 Previous build caches not available.
13:49:45.900 Cloning completed: 805.000ms
13:49:46.428 Running "vercel build"
13:49:47.501 Vercel CLI 50.42.0
13:49:47.938 Installing dependencies...
13:50:05.931 npm warn deprecated next@15.5.4: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
13:50:06.921 
13:50:06.922 added 534 packages in 19s
13:50:06.922 
13:50:06.922 149 packages are looking for funding
13:50:06.923   run `npm fund` for details
13:50:07.349 Detected Next.js version: 15.5.4
13:50:07.355 Running "npm run build"
13:50:07.568 
13:50:07.569 > schoolhub@0.1.0 build
13:50:07.569 > next build --turbopack
13:50:07.569 
13:50:08.527 Attention: Next.js now collects completely anonymous telemetry regarding usage.
13:50:08.528 This information is used to shape Next.js' roadmap and prioritize features.
13:50:08.528 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
13:50:08.528 https://nextjs.org/telemetry
13:50:08.528 
13:50:08.585    ▲ Next.js 15.5.4 (Turbopack)
13:50:08.586 
13:50:08.649    Creating an optimized production build ...
13:50:53.824  ✓ Finished writing to disk in 145ms
13:50:53.968  ✓ Compiled successfully in 45s
13:50:53.971    Linting and checking validity of types ...
13:51:06.914 
13:51:06.914 ./app/SchoolAdmin/SchoolProfile/page.tsx
13:51:06.914 577:19  Warning: Unused eslint-disable directive (no problems were reported from '@next/next/no-img-element').
13:51:06.914 643:20  Warning: Unused eslint-disable directive (no problems were reported from '@next/next/no-img-element').
13:51:06.914 700:20  Warning: Unused eslint-disable directive (no problems were reported from '@next/next/no-img-element').
13:51:06.914 
13:51:06.914 ./app/SchoolAdmin/teacherapp/page.tsx
13:51:06.915 7:10  Warning: 'activeTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:51:06.915 7:21  Warning: 'setActiveTab' is assigned a value but never used.  @typescript-eslint/no-unused-vars
13:51:06.915 
13:51:06.915 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
13:51:17.967    Collecting page data ...
13:51:19.484    Generating static pages (0/99) ...
13:51:21.241    Generating static pages (24/99) 
13:51:23.189    Generating static pages (49/99) 
13:51:23.189    Generating static pages (74/99) 
13:51:23.190  ✓ Generating static pages (99/99)
13:51:24.043    Finalizing page optimization ...
13:51:24.048    Collecting build traces ...
13:51:29.021 
13:51:29.028 Route (app)                                    Size  First Load JS
13:51:29.028 ┌ ○ /                                           0 B         165 kB
13:51:29.029 ├ ○ /_not-found                                 0 B         165 kB
13:51:29.029 ├ ○ /Academic                               6.41 kB         307 kB
13:51:29.029 ├ ○ /Academic/Attendance                    7.71 kB         176 kB
13:51:29.029 ├ ○ /Academic/Exams                         5.27 kB         355 kB
13:51:29.030 ├ ○ /Academic/Leaves                        7.45 kB         176 kB
13:51:29.030 ├ ○ /Academic/Notifications                 7.82 kB         177 kB
13:51:29.030 ├ ○ /Academic/Parents                       5.95 kB         175 kB
13:51:29.030 ├ ○ /Academic/Routine                       11.9 kB         181 kB
13:51:29.030 ├ ○ /Academic/Setting                       6.92 kB         176 kB
13:51:29.030 ├ ○ /Academic/Students                      12.1 kB         194 kB
13:51:29.030 ├ ○ /Academic/Subjects                       7.5 kB         176 kB
13:51:29.031 ├ ○ /Accounting                             21.3 kB         302 kB
13:51:29.031 ├ ○ /Accounting/assets                      8.69 kB         174 kB
13:51:29.031 ├ ○ /Accounting/assets/activity             6.66 kB         172 kB
13:51:29.031 ├ ○ /Accounting/assets/add                  6.12 kB         171 kB
13:51:29.031 ├ ○ /Accounting/assets/depreciation         6.55 kB         171 kB
13:51:29.031 ├ ○ /Accounting/assets/furniture              445 B         174 kB
13:51:29.031 ├ ○ /Accounting/assets/it                     432 B         174 kB
13:51:29.032 ├ ○ /Accounting/assets/lab                    398 B         174 kB
13:51:29.032 ├ ○ /Accounting/assets/land                   405 B         174 kB
13:51:29.032 ├ ○ /Accounting/assets/library                370 B         174 kB
13:51:29.032 ├ ○ /Accounting/assets/vehicles               373 B         174 kB
13:51:29.032 ├ ○ /Accounting/configuration                 386 B         172 kB
13:51:29.033 ├ ○ /Accounting/configuration/bank-cash     4.09 kB         175 kB
13:51:29.033 ├ ○ /Accounting/configuration/coa           3.86 kB         175 kB
13:51:29.033 ├ ○ /Accounting/configuration/contacts      3.97 kB         175 kB
13:51:29.034 ├ ○ /Accounting/configuration/fiscal-year   4.47 kB         176 kB
13:51:29.034 ├ ○ /Accounting/configuration/organization  8.15 kB         180 kB
13:51:29.035 ├ ○ /Accounting/configuration/tax           4.95 kB         176 kB
13:51:29.036 ├ ○ /Accounting/notifications               5.53 kB         170 kB
13:51:29.036 ├ ○ /Accounting/reports                     7.05 kB         172 kB
13:51:29.036 ├ ○ /Accounting/reports/balance-sheet       6.53 kB         171 kB
13:51:29.037 ├ ○ /Accounting/reports/cash-flow           6.59 kB         172 kB
13:51:29.039 ├ ○ /Accounting/reports/profit-loss         6.59 kB         172 kB
13:51:29.040 ├ ○ /Accounting/reports/trial-balance       6.52 kB         171 kB
13:51:29.040 ├ ○ /Accounting/settings                    8.47 kB         173 kB
13:51:29.041 ├ ○ /Accounting/tds                         15.6 kB         181 kB
13:51:29.041 ├ ○ /Accounting/Voucher                     12.7 kB         178 kB
13:51:29.041 ├ ○ /Administrative                         12.7 kB         178 kB
13:51:29.041 ├ ○ /Administrative/notice-board            8.47 kB         173 kB
13:51:29.041 ├ ○ /Administrative/parentapp               7.71 kB         173 kB
13:51:29.041 ├ ○ /Administrative/settings                13.3 kB         184 kB
13:51:29.041 ├ ○ /Administrative/staff                   17.2 kB         182 kB
13:51:29.042 ├ ○ /Administrative/studentapp              8.19 kB         173 kB
13:51:29.042 ├ ○ /Administrative/teacherapp              8.38 kB         173 kB
13:51:29.042 ├ ○ /Administrative/Teachers                7.39 kB         172 kB
13:51:29.042 ├ ○ /Administrative/templates               7.82 kB         173 kB
13:51:29.042 ├ ○ /Administrative/timetable/attendance    7.85 kB         173 kB
13:51:29.043 ├ ○ /Administrative/timetable/settings      7.56 kB         172 kB
13:51:29.043 ├ ƒ /api/accounting/bank-cash                   0 B            0 B
13:51:29.043 ├ ƒ /api/accounting/coa                         0 B            0 B
13:51:29.043 ├ ƒ /api/accounting/contacts                    0 B            0 B
13:51:29.043 ├ ƒ /api/accounting/fiscal-years                0 B            0 B
13:51:29.043 ├ ƒ /api/accounting/organization                0 B            0 B
13:51:29.043 ├ ƒ /api/accounting/tax                         0 B            0 B
13:51:29.043 ├ ƒ /api/voucher                                0 B            0 B
13:51:29.043 ├ ƒ /api/voucher/[id]/post                      0 B            0 B
13:51:29.043 ├ ○ /login                                  7.46 kB         172 kB
13:51:29.043 ├ ○ /Parent                                 8.64 kB         177 kB
13:51:29.043 ├ ○ /Principal                                219 B         165 kB
13:51:29.043 ├ ○ /SchoolAdmin                            1.76 kB         184 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics                  10.5 kB         313 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Attendance       11.8 kB         182 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Exams            1.25 kB         362 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Leaves           11.5 kB         182 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Notifications    11.9 kB         183 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Parents           1.9 kB         181 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Routine          7.87 kB         187 kB
13:51:29.044 ├ ○ /SchoolAdmin/Academics/Setting          2.87 kB         182 kB
13:51:29.045 ├ ○ /SchoolAdmin/Academics/Students         16.5 kB         201 kB
13:51:29.045 ├ ○ /SchoolAdmin/Academics/Subjects         3.49 kB         183 kB
13:51:29.045 ├ ○ /SchoolAdmin/Accounting                 26.1 kB         313 kB
13:51:29.045 ├ ○ /SchoolAdmin/Accounting/configuration     433 B         165 kB
13:51:29.045 ├ ○ /SchoolAdmin/Accounting/settings        13.3 kB         184 kB
13:51:29.045 ├ ○ /SchoolAdmin/Accounting/Voucher           430 B         165 kB
13:51:29.045 ├ ƒ /SchoolAdmin/Administrative                 0 B         165 kB
13:51:29.045 ├ ○ /SchoolAdmin/Administrative/profile     13.3 kB         184 kB
13:51:29.046 ├ ○ /SchoolAdmin/Dashboard                      0 B         179 kB
13:51:29.046 ├ ○ /SchoolAdmin/notice-board               2.43 kB         184 kB
13:51:29.046 ├ ○ /SchoolAdmin/parentapp                  1.39 kB         183 kB
13:51:29.046 ├ ○ /SchoolAdmin/SchoolProfile               4.4 kB         184 kB
13:51:29.046 ├ ○ /SchoolAdmin/staff                      3.07 kB         185 kB
13:51:29.047 ├ ○ /SchoolAdmin/Student                    3.35 kB         185 kB
13:51:29.047 ├ ○ /SchoolAdmin/studentapp                 1.91 kB         184 kB
13:51:29.047 ├ ƒ /SchoolAdmin/Subcripition                   0 B         165 kB
13:51:29.047 ├ ○ /SchoolAdmin/teacherapp                 2.12 kB         184 kB
13:51:29.047 ├ ○ /SchoolAdmin/Teachers                   1.26 kB         183 kB
13:51:29.048 ├ ○ /SchoolAdmin/timetable/attendance        1.6 kB         183 kB
13:51:29.048 ├ ○ /SchoolAdmin/timetable/settings         1.25 kB         183 kB
13:51:29.048 ├ ○ /SchoolAdmin/voucher                    9.29 kB         174 kB
13:51:29.048 ├ ○ /Student                                 129 kB         298 kB
13:51:29.048 ├ ○ /Student/Dashboard                          0 B         165 kB
13:51:29.048 ├ ○ /SuperAdmin/Dashboard                   8.98 kB         182 kB
13:51:29.049 ├ ○ /SuperAdmin/School                       161 kB         334 kB
13:51:29.049 ├ ○ /SuperAdmin/Setting                      9.9 kB         182 kB
13:51:29.049 └ ○ /Teacher                                15.4 kB         300 kB
13:51:29.049 + First Load JS shared by all                179 kB
13:51:29.049   ├ chunks/150316a471952cee.js              59.2 kB
13:51:29.051   ├ chunks/7893f82bb3c7b6e9.js                13 kB
13:51:29.051   ├ chunks/ad485e1ef0aa584e.js              17.2 kB
13:51:29.051   └ chunks/f248a3f2a3dcf35d.js              40.1 kB
13:51:29.051   ├ chunks/4f99a2e9c3d1eaf0.css             13.6 kB
13:51:29.051   └ other shared chunks (total)             35.5 kB
13:51:29.052 
13:51:29.053 
13:51:29.053 ○  (Static)   prerendered as static content
13:51:29.053 ƒ  (Dynamic)  server-rendered on demand
13:51:29.053 
13:51:29.559 Traced Next.js server files in: 91.514ms
13:51:30.297 Created all serverless functions in: 736.891ms
13:51:30.320 Collected static files (public/, static/, .next/static): 11.058ms
13:51:30.674 Build Completed in /vercel/output [2m]
13:51:30.976 Error: Vulnerable version of Next.js detected, please update immediately. Learn More: https://vercel.link/CVE-2025-66478