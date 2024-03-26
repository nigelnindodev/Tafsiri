<a name="readme-top"></a>
<div align="center">

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>

<div align="center"> 

[![Build][build-shield]][build-url]
[![Test][test-shield]][test-url]

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Tafsiri</h3>

  <p align="center">
    Payments and inventory management web platform powered by HTMX. 
    <br />
    <a href="https://bunhtmxfullstack.onrender.com/swagger"><strong>Swagger Documentation »</strong></a>
    <br />
    <br />
    <a href="https://bunhtmxfullstack.onrender.com">View Demo</a>
    ·
    <a href="https://github.com/nigelnindodev/Tafsiri/issues">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
  </p>
</div>

<div align="center">

*Initial load time to view demo and swagger documentation may take up to one minute due to cold booting.* 

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)


Tafsiri in Swahili means to translate, or as more applicable in the context, understand.

This project was born from some observations I made at a friend's business establishment:

- Payments are recorded manually in a ledger book. This is quite common in Kenya, though with has some downsides:
  - Difficult to know who made a payment recording. This was being eye balled using the cashier's handwriting at times, it just turned out two of the cashiers have similar handwriting, leading to confusion.
- Impossible to know the day's running sales unless the ledger book is reviewed
- It takes a lot of time to calculate the total sales for an particular day/week/month, as all slaes have to painstakingly be gone through one by one
  - This is also prone to human error


Tasfiri automates recording of sales and keeping track of inventory via a web based platform. Care has been taken to add a good UX and create a flow where there is as little input by cashiers as possible.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![Bun][Bun]][Bun-url]
* [![Cheerio][Cheerio]][Cheerio-url]
* [![Docker][Docker]][Docker-url]
* [![ElysiaJS][ElysiaJS]][ElysiaJS-url]
* [![HTMX][HTMX]][HTMX-url]
* [![PicoCSS][PicoCSS]][PicoCSS-url]
* [![TypeORM][TypeORM]][TypeORM-url]

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

Multiple ways to get started are supported. But they all start with cloning the repo:
```sh
git clone https://github.com/nigelnindodev/Tafsiri.git
```

#### Local Installation

A local installation assumes you have a local PostgreSQL Server running, docker installed, and are running Linux, MacOS or Windows Subsystem for Linux (WSL). 

Install the latest version of Bun:
```sh
curl -fsSL https://bun.sh/install | bash
```

Install project dependencies
```sh
bun install --frozen-lockfile
```

Add a `.env` file with the following properties:
```sh
APPLICATION_PORT=3000
BASE_URL="http://localhost:3000"
JWT_SECRET="some_jwt_secret"
POSTGRES_USER="your_local_postgres_user"
POSTGRES_PASSWORD="your_local_postgres_password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DATABASE_NAME="your_local_postgres_database_name"
```

Run the project in development mode
```sh
bun run dev
```

Install project dependencies
```sh
bun install --frozen-lockfile
```

Add a `.env` file with the following properties:
```sh
APPLICATION_PORT=3000
BASE_URL="http://localhost:3000"
JWT_SECRET="some_jwt_secret"
POSTGRES_USER="your_local_postgres_user"
POSTGRES_PASSWORD="your_local_postgres_password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DATABASE_NAME="your_local_postgres_database_name"
```

Run the project in development mode
```sh
bun run dev
```
Open http://localhost:3000/ with your browser to see the result.

##### Run Test
To run tests, use the command from `package.json`:
```sh
bun run setup-run-test
```

That will use the `compose.yaml` file to create a testing PostgreSQL server instance using docker, and ensure it's volume is correctly cleared up after running tests. 

#### Docker Installation

TBA

<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

### TODO
- [x] Remove long polling in creation of an order
- [x] Instead of repeating try/catch error handling for each service method, refactor the try catch to wrap all controller methods. TODO: Does this this also propagate to the service methods? This will be interesting to find out!
- [x] Add Zod for handling API validations
- [x] Use snake_case for all DB columns (Untested across the board, unit tests would have been nice right now :-))
- [x] Add DB indexes
- [x] Improve logging with ts-log and create standard semantics for logs
- [x] For HTMX sections where we replace all content(hx-target="outerHTML"), would be a good practice to place these sections in constants sine they are referenced in multiple locations. Should we then choose to rename them, we'll then just need to change once reference (DRY)
- [x] Ensure once order item added to an order, it's price is immutable
- [x] Fix bug with updated at not correctly propagating on DB level (a workaround is currently being used). Was not working because updated_at on date functionality is only supported on Postgres for TypeORM. So the workaround is the solution.
- [x] Remove hardcoding of base url
- [x] Return BAD REQUEST on failed Zod validations
- [X] API tests
- [ ] HTMX input white listing (Maybe important to avoid XSS attacks)
- [ ] Timezone awareness
- [ ] Proper handling of amounts with decimals

### Updcoming Features
- [x] Authentication (username & password) to prevent unauthorized access
- [x] Add staff details to an order to know who completed an order. Staff can log in with their dedicated credentials.
- [x] Restriction of sensitive sections of the service to admin users only i.e Inventory Section (which can change pricing of items)
- [ ] Ability to filter for payments according to date and time interval
- [ ] Pagination of data (currently fetching all rows from the DB, this isn't feasible for a real world project)
- [ ] Store when a user last logged in
- [ ] Manual reconciliation via CSV and/or Excel/Google Sheets
- [ ] IP Address white listing (help for example ensure the service can only be accessed when connected to the store's WiFi)

### Would be nice
- [ ] End to end tests with Puppeteer
- [ ] MetaBase for more in depth BI analysis
- [ ] Automated daily backups of all transactions to CSV files (stored on S3 buckets)
- [ ] Allow for changes to a confirmed order
- [ ] Add partial and deferred payments, together with tracking of the same
- [ ] Maybe to be added, but also tracking of how many inventory items are coming in. This together with order tracking can automate knowing how many inventory items are left in stock
- [ ] Mobile App?


See the [open issues](https://github.com/nigelnindodev/Tafsiri/issues) for a full list of proposed features (and known issues).
See the [project roadmap](https://github.com/users/nigelnindodev/projects/4) for what's currently being worked on, and future work.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are much welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Your Name - [@nigelnindo](https://twitter.com/nigelnindo) - nigelnindodev@gmail.com

Project Link: [https://github.com/nigelnindodev/Tafsiri](https://github.com/nigelnindodev/Tafsiri)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [HTMX for Impatient Devs](https://www.youtube.com/watch?v=TT7SV-bAZyA)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[build-shield]: https://github.com/nigelnindodev/Tafsiri/actions/workflows/build.yml/badge.svg
[build-url]: https://github.com/nigelnindodev/Tafsiri/actions/workflows/build.yml
[test-shield]: https://github.com/nigelnindodev/Tafsiri/actions/workflows/test.yml/badge.svg
[test-url]: https://github.com/nigelnindodev/Tafsiri/actions/workflows/build.yml
[issues-shield]: https://img.shields.io/github/issues/nigelnindodev/Tafsiri.svg?style=for-the-badge
[issues-url]: https://github.com/nigelnindodev/Tafsiri/issues
[license-shield]: https://img.shields.io/github/license/nigelnindodev/Tafsiri.svg?style=for-the-badge
[license-url]: https://github.com/nigelnindodev/Tafsiri/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
[Bun]: https://img.shields.io/badge/Bun-35495E?style=for-the-badge&logo=bun&logoColor=4FC08D
[Bun-url]: https://bun.sh
[Cheerio]: https://img.shields.io/badge/Cheerio.js-35495E?style=for-the-badge&logo=cheerio&logoColor=4FC08D
[Cheerio-url]: https://cheerio.js.org/
[Docker]: https://img.shields.io/badge/Docker-35495E?style=for-the-badge&logo=docker&logoColor=4FC08D
[Docker-url]: https://www.docker.com/
[ElysiaJS]: https://img.shields.io/badge/ElysiaJS-35495E?style=for-the-badge&logo=htmx&logoColor=4FC08D
[ElysiaJS-url]: https://elysiajs.com/
[HTMX]: https://img.shields.io/badge/HTMX-35495E?style=for-the-badge&logo=htmx&logoColor=4FC08D
[HTMX-url]: https://htmx.org
[PicoCSS]: https://img.shields.io/badge/PicoCSS-35495E?style=for-the-badge&logo=css3&logoColor=4FC08D
[PicoCSS-url]: https://picocss.com/
[TypeORM]: https://img.shields.io/badge/TypeORM-35495E?style=for-the-badge&logo=htmx&logoColor=4FC08D
[TypeORM-url]: https://typeorm.io/
