Create a modern design application for voting.

Frontend Stack

    React: Modern UI library for building interactive interfaces
    TypeScript: Type-safe JavaScript for better reliability
    Vite: Next-generation frontend tooling for fast development
    Tailwind CSS: Utility-first CSS framework for custom designs
    Shadcn UI: High-quality UI components built with Radix UI and Tailwind
    Framer Motion: Animation library for smooth, performant transitions
    React Query: Data fetching and state management library
    React Router: Client-side routing for single-page applications


First, the admin panel.
To access the admin panel a user must have "x-api-key" to gain access,
you may use /v1/admin/members endpoint to check if the key is correct and redirect a user to 
the admin page.

There should be GUI to add/update/delete users AND the important, "Generate Token" button that will
generate a QR code that will be shown to a user to register, a user scans QR code and redirected to a page
with "Name" and "Username" prompt and the token already in the "Token" field, and the user will click register to call
/v1/register/{token} endpoint.

The application must be dynamic and refresh the data when needed.

If a username unique and registration is a success, the member's cookie "users-token" will be set
to identify member and validate requests.

A member can see his profile using GET /v1/users/me endpoint 
, update the profile using PATCH /v1/users/me endpoint 
or delete the profile using DELETE /v1/users/me endpoint 


A member can join a team using POST /v1/users/join/{team_id} endpoint
if a user has already joined a team before  - and error will be thrown
otherwise - a member will join a team and "team_id" "has_joined_team" attributes will be updated


Or a member can leave his team, the backend will identify 
a member based on the cookie and break relationship with team table

A member can vote for a foreign team using POST /v1/voting/{team_id} , if a member tries to vote for his own team
an error will be thrown, otherwise - success

Or a member can remove his vote using POST /v1/voting/rollback/ endpoint

A member may belong to no team, but still vote for a team

A team has a name and an avatar URL which must be displayed

An .env file must be used for frontend containing VITE_API_BASE_URL= variable to set the backend root url
