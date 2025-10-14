# SchoolHub ERP (MVP)

A simple, white, clean School ERP built on Next.js (App Router) using client-side storage for quick evaluation.

## Features

- **Auth & Roles**: Login with user ID, password, and role. Separate Super Admin login.
- **Role-based Navigation**: Only see modules permitted for the selected role.
- **Dashboard**: Key counts for Students, Teachers, Classes, Fees due.
- **Modules**:
  - Teachers, Classes, Attendance, Exams
  - Fees (uses "Rs." as currency)
  - Library, Hostel, Inventory
  - Notices (publish announcements to role audiences)
- **Data Persistence**: Browser localStorage via typed helpers.

## Getting Started

1. Install deps and run:
```bash
npm install
npm run dev
```
2. Open http://localhost:3000
3. Click Login and use any non-empty credentials:
   - User ID/Username: any
   - Password: any
   - Role: choose from non-super-admin roles
4. For Super Admin: go to `/superadmin/login` and enter credentials.

## Roles and Access

- Teachers: Teachers, Classes, Attendance, Exams, Notices
- Admin Academic: Teachers, Classes, Attendance, Exams, Notices
- Admin Finance: Fees, Notices
- Admin Inventory: Library, Hostel, Inventory, Notices
- Student/Parent: Fees (Parent), Notices
- Super Admin: All modules (separate login page)

## Files of Interest

- `app/context/AuthContext.tsx` – mock auth provider
- `app/components/Protected.tsx` – route guard
- `app/components/Nav.tsx` – top navigation (white theme)
- `app/lib/types.ts` – entity types
- `app/lib/db.ts` – typed localStorage CRUD
- `app/globals.css` – global white UI styles
- Module pages in `app/*/page.tsx`

## Notes

- This is an MVP using localStorage for demo. For production, add API routes and a real database.
- UI is intentionally plain and white per requirements.
- Student module is hidden from nav and restricted to Super Admin only.

## License

For internal testing/demo.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
