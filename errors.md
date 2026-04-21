 npm run dev

> schoolhub@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.5.4 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.18.69:3000

 ✓ Starting...
 ✓ Ready in 1110ms
 ○ Compiling /SchoolAdmin/Academics/Subjects ...
 ✓ Compiled /SchoolAdmin/Academics/Subjects in 3.4s
 GET /SchoolAdmin/Academics/Subjects 200 in 4175ms
 ○ Compiling /favicon.ico ...
 ✓ Compiled /favicon.ico in 763ms
◇ injected env (3) from server/.env // tip: ◈ encrypted .env [www.dotenvx.com]
[Auth] JWT_SECRET loaded: from env
 GET /favicon.ico?favicon.04914098.ico 200 in 1520ms
GET holidays error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/holidays/route.ts:11:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/holidays?academicYear=2081-2082 500 in 31401ms
GET subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:14:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/subjects?className=Class+1&academicYear=2081-2082 500 in 31520ms
GET subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:14:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/subjects 500 in 31580ms
GET subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:14:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/subjects?className=Class+1&academicYear=2083-2084 500 in 30385ms
GET subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:14:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/subjects?className=Class+10&academicYear=2083-2084 500 in 30350ms
POST subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async POST (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:72:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 POST /SchoolAdmin/Academics/Subjects/api/subjects 500 in 30331ms
GET holidays error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/holidays/route.ts:11:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/holidays?academicYear=2081-2082 500 in 30336ms
GET subjects error: MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
    at <unknown> (MongoServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017)
    at async connectToDatabase (app/SchoolAdmin/Academics/Subjects/lib/db.ts:15:3)
    at async GET (app/SchoolAdmin/Academics/Subjects/api/subjects/route.ts:14:20)
  13 |
  14 |   const client = new MongoClient(MONGODB_URI);
> 15 |   await client.connect();
     |   ^
  16 |   
  17 |   const db = client.db(DB_NAME);
  18 |    {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
      at <unknown> (MongoNetworkError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017) {
    errorLabelSet: Set(3) { 'SystemOverloadedError', 'RetryableError', 'ResetPool' },
    beforeHandshake: false,
    [cause]: [AggregateError: ] { code: 'ECONNREFUSED' }
  }
}
 GET /SchoolAdmin/Academics/Subjects/api/subjects?className=Class+1&academicYear=2083-2084 500 in 30323ms


Concole error:
react-dom-client.development.js:25630 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
turbopack-hot-reloader-common.ts:43 [Fast Refresh] rebuilding
report-hmr-latency.ts:26 [Fast Refresh] done in 748ms
RoutineTable.tsx:79  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/holidays?academicYear=2081-2082 500 (Internal Server Error)
(anonymous) @ RoutineTable.tsx:79
(anonymous) @ RoutineTable.tsx:92
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
<RoutineTable>
(anonymous) @ react-jsx-dev-runtime.development.js:323
SchoolAdminAcademicSubjectsPage @ page.tsx:274
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
<SchoolAdminAcademicSubjectsPage>
(anonymous) @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.tsx:60
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1332
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:3460
(anonymous) @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
(anonymous) @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
(anonymous) @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
turbopack-hot-reloader-common.ts:43 [Fast Refresh] rebuilding
RoutineTable.tsx:56  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/subjects?className=Class+1&academicYear=2081-2082 500 (Internal Server Error)
(anonymous) @ RoutineTable.tsx:56
(anonymous) @ RoutineTable.tsx:93
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
<RoutineTable>
(anonymous) @ react-jsx-dev-runtime.development.js:323
SchoolAdminAcademicSubjectsPage @ page.tsx:274
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
<SchoolAdminAcademicSubjectsPage>
(anonymous) @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.tsx:60
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1332
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:3460
(anonymous) @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
(anonymous) @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
(anonymous) @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.tsx:35  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/subjects 500 (Internal Server Error)
(anonymous) @ page.tsx:35
(anonymous) @ page.tsx:79
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14398
flushPassiveEffects @ react-dom-client.development.js:16337
(anonymous) @ react-dom-client.development.js:15973
performWorkUntilDeadline @ scheduler.development.js:45
<SchoolAdminAcademicSubjectsPage>
(anonymous) @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.tsx:60
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1332
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:3460
(anonymous) @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
(anonymous) @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
(anonymous) @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
report-hmr-latency.ts:26 [Fast Refresh] done in 208ms
SubjectForm.tsx:49  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/subjects?className=Class+1&academicYear=2083-2084 500 (Internal Server Error)
(anonymous) @ SubjectForm.tsx:49
(anonymous) @ SubjectForm.tsx:68
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
<SubjectForm>
(anonymous) @ react-jsx-dev-runtime.development.js:323
SchoolAdminAcademicSubjectsPage @ page.tsx:242
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopSync @ react-dom-client.development.js:15546
renderRootSync @ react-dom-client.development.js:15526
performWorkOnRoot @ react-dom-client.development.js:14990
performSyncWorkOnRoot @ react-dom-client.development.js:16830
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16676
processRootScheduleInMicrotask @ react-dom-client.development.js:16714
(anonymous) @ react-dom-client.development.js:16849
<SchoolAdminAcademicSubjectsPage>
(anonymous) @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.tsx:60
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
Promise.all @ VM3059 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1332
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:3460
(anonymous) @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
(anonymous) @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
(anonymous) @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
SubjectForm.tsx:49  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/subjects?className=Class+10&academicYear=2083-2084 500 (Internal Server Error)
(anonymous) @ SubjectForm.tsx:49
(anonymous) @ SubjectForm.tsx:68
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
<SubjectForm>
(anonymous) @ react-jsx-dev-runtime.development.js:323
SchoolAdminAcademicSubjectsPage @ page.tsx:242
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopSync @ react-dom-client.development.js:15546
renderRootSync @ react-dom-client.development.js:15526
performWorkOnRoot @ react-dom-client.development.js:14990
performSyncWorkOnRoot @ react-dom-client.development.js:16830
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16676
processRootScheduleInMicrotask @ react-dom-client.development.js:16714
(anonymous) @ react-dom-client.development.js:16849
page.tsx:102  POST http://localhost:3000/SchoolAdmin/Academics/Subjects/api/subjects 500 (Internal Server Error)
(anonymous) @ page.tsx:102
(anonymous) @ page.tsx:245
(anonymous) @ SubjectForm.tsx:105
executeDispatch @ react-dom-client.development.js:16970
runWithFiberInDEV @ react-dom-client.development.js:871
processDispatchQueue @ react-dom-client.development.js:17020
(anonymous) @ react-dom-client.development.js:17621
batchedUpdates$1 @ react-dom-client.development.js:3311
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17174
dispatchEvent @ react-dom-client.development.js:21357
dispatchDiscreteEvent @ react-dom-client.development.js:21325
<form>
(anonymous) @ react-jsx-dev-runtime.development.js:323
(anonymous) @ SubjectForm.tsx:111
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopSync @ react-dom-client.development.js:15546
renderRootSync @ react-dom-client.development.js:15526
performWorkOnRoot @ react-dom-client.development.js:14990
performSyncWorkOnRoot @ react-dom-client.development.js:16830
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16676
processRootScheduleInMicrotask @ react-dom-client.development.js:16714
(anonymous) @ react-dom-client.development.js:16849
<SubjectForm>
(anonymous) @ react-jsx-dev-runtime.development.js:323
SchoolAdminAcademicSubjectsPage @ page.tsx:242
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopSync @ react-dom-client.development.js:15546
renderRootSync @ react-dom-client.development.js:15526
performWorkOnRoot @ react-dom-client.development.js:14990
performSyncWorkOnRoot @ react-dom-client.development.js:16830
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16676
processRootScheduleInMicrotask @ react-dom-client.development.js:16714
(anonymous) @ react-dom-client.development.js:16849
RoutineTable.tsx:79  GET http://localhost:3000/SchoolAdmin/Academics/Subjects/api/holidays?academicYear=2081-2082 500 (Internal Server Error)
(anonymous) @ RoutineTable.tsx:79
(anonymous) @ RoutineTable.tsx:92
react_stack_bottom_frame @ react-dom-client.development.js:23668
runWithFiberInDEV @ react-dom-client.development.js:871
commitHookEffectListMount @ react-dom-client.development.js:12344
commitHookPassiveMountEffects @ react-dom-client.development.js:12465
commitPassiveMountOnFiber @ react-dom-client.development.js:14386
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14389
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14513
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
commitPassiveMountOnFiber @ react-dom-client.development.js:14379
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:14359
