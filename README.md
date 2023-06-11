# 3DVerse Server Information

This portion of the documentation explains the features of the server that has been implemented to complete the challenge.

## How to Run?

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate into the server directory and install dependencies:
   ```sh
   cd server
   npm install
   ```
3. Start the server:
   ```sh
   npm run start
   ```
4. Open a separate terminal to start the frontend inside root folder:
   ```
   npm run start:w
   ```

## Information

- The default port for the server has been set to `3333`
- The API docs can be accessed at `http://localhost:3333/docs`. Direct Link: [Docs](http://localhost:3333/docs)
- **Worker Threads**: Node Worker Threads have been implemented to handle the transform & download feature. This will enable the main thread not to be blocked and keep processing other requests as they come in.
- **File System**: No database is being used. Everything is being done on the filesystem using Node's 'fs' module.
- **Metadata Management**: Metadata related to files are being saved in a json file inside `uploads` folder

---

# Challenge 3dfilestore Web

In this challenge, you will design the REST API and implement the backend features of a 3D file repository web application. The frontend of the web application is provided.

## Constraints

Your server should be efficient performance-wise:

- should not exceed ~512Mb of memory usage
- should support multiple clients at the same time

However, the performance of the database you choose will not be taken into account for this evaluation.

## Features

The server should support a single 3D file format. [OBJ Wavefront](https://en.wikipedia.org/wiki/Wavefront_.obj_file) is the suggested format but could be changed at your convenience.

The 3D file repository has the following features:

- Upload a 3D file
- List 3D files uploaded on the server
- Download file
- Rename file
- Delete file
- Download a transformed file ([see below](#Transform-and-Download-feature))

On the server-side, you can decide how you store the files (with the database of your choice or even using the file system).

## Goals

You should provide:

- A fully implemented and standalone backend code written in `Typescript`
- An [OpenAPI](https://www.openapis.org) specification file for your REST operations
- If your backend requires external dependencies such as a database, it should be either standalone (e.g. sqlite) or containerized with [Docker Compose](https://docs.docker.com/compose)

The frontend code is provided and has a mock of each requested features.

The transform feature is displayed as a link with hardcoded arguments, but keep in mind that arguments are just placeholders, and could be set manually by a user.

## Interfacing your API with the existing Web App

Modify the arguments passed to each function in `./src/api/functions.ts`.
Look for `// Todo:` comments or `<replace-me>` placeholders.

## Transform and Download feature

The **Transform and Download** is a special functionality that will transform each vertices in the file with a given scale and translation vector.

For example with an _obj_ the vertices are described like this:

```obj
v 1  1  1
v 1  0  1
v 2 10 10
```

The transform feature will allow you to download the file with a dynamic scale and translation vectors.
For example, if we specify `[2, 2, 2]` as a scale vector, the file will be downloaded and transformed like that:

```obj
v 2  2  2
v 2  0  2
v 4 20 20
```

With a `[10, 0, 0]` as a translation vector, the file will be downloaded and transformed like that:

```obj
v 11  1  1
v 11  0  1
v 20 10 10
```

> ⚠️ The transformed file should not alter the original file stored on the server! ⚠️

## Example `obj` files

You can find some `obj` files ready to use from the following links:

- [buggy.obj](https://storage.googleapis.com/corp-dev-challenge-3dfilestore-assets/buggy.obj)
- [engine.obj](https://storage.googleapis.com/corp-dev-challenge-3dfilestore-assets/engine.obj)
- [starwarsjuggeren.obj](https://storage.googleapis.com/corp-dev-challenge-3dfilestore-assets/starwarsjuggeren.obj)
- [teapot.obj](https://storage.googleapis.com/corp-dev-challenge-3dfilestore-assets/teapot.obj)
- [whale.obj](https://storage.googleapis.com/corp-dev-challenge-3dfilestore-assets/whale.obj)

## Toolchain

- [nodejs](https://nodejs.org): `>=18`
- [npm](https://www.npmjs.com): `>=9`

## How to use

```sh
npm install
npm run start:w
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/3dverse/challenge-3dfilestore-web/blob/main/LICENSE) file for details.
