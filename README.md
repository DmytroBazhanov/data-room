# Setup
1. Run 'npm install'
2. Add the file named '.env.local' and add there a key 'VITE_CLERK_PUBLISHABLE_KEY' which should be functioning clerk publishable key for auth and application to work properly.
3. Run 'npm run dev'


# Design and development decisions

## Structure

This is base structure i use for applications since i find it easier to navigate and split logic that way.

<pre>src/
├── assets/
├── components/
│   ├── custom/  <- Component created specifically for the app stored here
│   └── ui/      <- Shadcn components 
├── config/      <- Any config objects required to setup something in the app 
├── layouts/                   <- Layouts used throughout app
│   └── ApplicationLayout/
├── network/
│   ├── api/     <- Network calls logic
│   ├── mutations/ <- Usable react-query wrappers around api calls
│   └── queries/   <- Same here but for queries
├── routing/
│   ├── pages/
│   └── router.tsx
├── types/
└── utils/</pre>

## Implementation details

- Iframe for native pfd renders. Ideal compromise of speed of development and quality.
- Datastructure chosen to store the data is map. Constant speed searches, easy to navigate. Easy to redesign to work with No-SQL database.
- Regarding design, it is basically stripped down google drive, removed all the features that isn't present. Why go for google drive design? Widely used, common design, easy to get used to even if didn't work with it before. Additional controls in combination with tooltips should make it easier to use controls. Common controls between dataroom, folder and file entities should make it easier to understand how to work with each entity.

## AI usage

1. I designed the system and created mock design before actually approaching the codding part.
2. Setup the project, created simple AI rules to channel the AI compute into the structure I want to see and be able to edit in future.
3. Created first few components by myself and then started to prompt AI to implement features going through my notes from planning.
4. After generation phase were complete manually fixed present UI and logic bugs.
