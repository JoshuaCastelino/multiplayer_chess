# Multiplayer Chess

**Technologies:** React | PostgreSQL | C# | Docker

A web-based chess game that allows two players to play against each other in real time, hosted on [joshuacastelino.com](https://joshuacastelino.com).

## Features

- **Real-Time Gameplay:** Challenge a friend to a live chess match. Moves are updated instantly for both players, creating a smooth real-time experience.
- **Full Chess Rules:** Enforces all standard chess rules including legal moves, turn-based play, check and checkmate detection, stalemate detection, and more.
- **Game Lobbies:** 
  - Create a new game and share a unique game code or link with a friend.
  - Join an existing game using its code.
  - The game creator plays White by default.
- **User Accounts:** 
  - Sign up with a Google email and username to create an account.
  - The system tracks players and game outcomes (wins/losses) in a database.
- **Persistent Game Records:** Completed games are recorded (including players and the winner) for future reference and potential statistics.
- **Threat Colouring:** In single player mode, view which tiles are under threat by each player.
- ** No En-Passant** Banished a sneaky pawn trick nobody asked for!

## Architecture 

A basic architecture was selected to minimise costs, trading off scalability. Below is an outline of the components used:



<p align="center">
  <img src="https://github.com/user-attachments/assets/c4927c7c-24f4-4fd7-b756-fa696b0674c3" />
  <p align="center">Outline of architecture</p>
</p>


- **Vercel:** Chosen for its seamless integration with GitHub and ease of deployment.
- **NGINX:** Utilized for straightforward SSL certificate configuration, enabling HTTPS communication with the EC2 instance.
- **EC2:** Selected for its availability as a free-tier instance with sufficient uptime.
- **Postgres:** Preferred due to ease of setup and existing familiarity.
- **Docker:** Employed for usual benefits as well as possibility of simplifying future scalability,  when combined with K8s.
- **Google OAuth**: Simple to implement and eliminated need to store passwords in my database, enhancing security and reducing the application's vulnerability.
- **Dotnet:** Chosen primarily out of personal interest and exploration.
