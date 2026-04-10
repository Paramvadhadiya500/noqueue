# 1. Start with a lightweight, official Linux computer that has Node 20 pre-installed
FROM node:20-alpine

# 2. Create a folder inside this mini-computer to hold our app
WORKDIR /app

# 3. Copy ONLY the package files first (This is a pro-trick called "Layer Caching")
COPY package.json package-lock.json* ./

# 4. Install all dependencies fresh inside the Linux container
RUN npm install

# 5. Now, copy all the rest of your actual code into the container
COPY . .

# 6. Build the Next.js app for production (using the webpack script we fixed earlier)
RUN npm run build

# 7. Tell the container to open port 3000 so we can see it in our browser
EXPOSE 3000

# 8. The command that runs exactly when the container turns on
CMD ["npm", "run", "start"]