# Deploy and install procedure

## Deploy and Install GitLab Runner (Docker)

---

### Prerequerties

* Docker installed on your Linux machine. If Docker is not installed, follow [this guide](https://docs.docker.com/engine/install/)
* Access to a GitLab instance and a project or group where the runner will be registered
* GitLab Runner registration token (retrieved from your GitLab project or group settings)

-----

### 1. Pull the GitLab Runner Docker Image
To get started, download the official GitLab Runner image from Docker Hub :

```bash
docker pull gitlab/gitlab-runner:latest
```

-----

### 2. Run the GitLab Runner Container

    Start the GitLab Runner container. Replace <path-to-config> with a local directory to store configuration files:

```bash
docker run -d --name gitlab-runner --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v <path-to-config>:/etc/gitlab-runner \
    gitlab/gitlab-runner:latest
```
    **Note:** The `docker.sock` volume is required to enable Docker-in-Docker functionality for the runner

-----

### 3. Register the GitLab Runner
    
#### Obtain the registration Token:
1. Log in to GitLab
2. Go to Settings > CI/CD in your project or group
3. Expand the Runners section
4. Copy the registration token

#### Register the Runner using Docker:
Run the following command to register the GitLab Runner:
```bash
docker run --rm -it -v <path-to-config>:/etc/gitlab-runner gitlab/gitlab-runner:latest register

```
Follow the prompts:
1. Enter your GitLab instance URL (e.g., https://t-dev.epitest.eu/)
2. Paste the registration token
3. Provide a description for the runner (e.g., docker-runner)
4. Specify tags for the runner (e.g., docker,linux)
5. Choose the executor as docker

### 4. Configure Docker Executor
During the registration process, when asked to configure the executor, specify the following options:
* Default Image: Enter an appropriate Docker image (e.g., `alpine:latest` or `docker:20`)

---

### 5. Start the Runner
Once registration is complete, ensure the runner is active by restarting the container:
```bash
docker restart gitlab-runner
```
---

### 6. Verify Runner Registration

1. Go back to GitLab
2. Under Settings > CI/CD > Runners, confirm that the runner appears in the list and is marked as active.

### Configuration files :

#### Tokens and Configuration Files:
* The token used during registration is stored in <path-to-config>/config.toml
* Do not expose this token publicly as it allows unauthorized access to your runner

---

### Notes

#### Tokens and cofiguration files:
    * The token used during registration is stored in <path-to-config>/config.toml

    * Do not expose this token publicly as it allows unauthorized access to your runner
* Managing the runner : To stop or remove the runner container:
```bash
docker stop gitlab-runner
docker rm gitlab-runner
```
* Updating the Runner: To update the GitLab Runner to the latest version:
```bash
docker pull gitlab/gitlab-runner:latest
docker stop gitlab-runner
docker rm gitlab-runner
docker run -d --name gitlab-runner --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v <path-to-config>:/etc/gitlab-runner \
  gitlab/gitlab-runner:latest

```


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### How to create gitlab-runner 

    Prerequerties (Unix based OS)
    create an .env.local file with a USER_API_TOKEN="Your Token"
    You need to create your token in the CI/CD part don't forgot to allow API and runner creation
    Once this is done you have an automate.sh script that allow you to install the gitlab-runner and register your personnal runner