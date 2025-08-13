### Teams
Created functionality CRUDs for teams + admin dependency


### Members
Add func to report missing cookie token (API or WebSocket)

# General
Add WS endpoint to report registered users


# Description
This application represents a voting system, where a user must get a token from admin to register, join a team and vote for a team

To create a member - he should get a token from an admin,
(a screen with a QR code containing prepared URL with token in the query string must be provided) 
then create a new account using /v1/register/{token} endpoint inserting 
name and username into the request body and the token into the "x-api-key" header

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





## Admin panel
An admin can create, update, read and delete teams or members or somehow manipulate the data
But there are some restriction, like when a used is not related to a team but "has_joined" flag
is set to "True" - in that case an error will be thrown and the operation will be rolled back.

      "name": "string",
      "username": "string",
      "has_joined_team": false,
      "has_voted": false,
      "token": "string",
      "team_id": 0

Mandatory fields to create a user using admin panel
1. name
2. username
3. token
The rest will be None by default