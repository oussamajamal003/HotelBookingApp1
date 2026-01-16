I Added Swagger UI for API documentation and testing.
i created guards for authentication and then updated routes,swagger

3 guards created:

-Auth Guard: checks JWT and allows access only if the user is authenticated.

-Role Guard: Ensures the authenticated user is an admin (here i added a column role in mysql)

-ownershipguard (now not used): Verify an authenticated user is permitted to access something like his profile for example
on api/auth/ and api/auth/logout routes i implemented a authguard 
on api/auth/ route i implemented a roleguard("admin") 

Login and signup are public because users are not authenticated