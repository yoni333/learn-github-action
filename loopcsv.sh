#!/bin/bash

# Path to the CSV file
CSV_FILE="package-json-update.csv"

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "CSV file not found!"
    exit 1
fi

# Extract the first column and save it into a variable
FOLDERS=$(awk -F, '{if(NR>1)print $1}' "$CSV_FILE")

# Loop through each folder
for folder in $FOLDERS; do
    # Skip if folder is empty
    if [ -z "$folder" ]; then
        continue
    fi

    echo "Changing to directory: $folder"
    # Change to the directory
    cd "$folder"

    # Check if directory change was successful
    if [ $? -eq 0 ]; then
        echo "Running npm install in $folder"
        # Run npm install
        npm install --verbose
        
       
        # Check if npm install was successful
        if [ $? -ne 0 ]; then
            echo "npm install failed in $folder"
            exit 1
        fi

        npm i @yaakovhatam/take-npm-packages --save-dev
        npx @yaakovhatam/take-npm-packages --subdeps
        npx @yaakovhatam/take-npm-packages -d -i
        # Zip the folder with its updated package.json and the npm-packages directory
        echo "Zipping the folder $folder"
        tar -czvf "${folder}_package-json-update.tgz"  npm-packages/ package-json-update.csv
        echo "move the tgz file to root folder"

        # Set the destination based on the OS type
        if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
            DESTINATION="$HOME/Desktop"
        else
            DESTINATION="%USERPROFILE%\Desktop"
        fi

        # Try using 'move' first, then fallback to 'mv' if 'move' is not found
        if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
            move "${folder}_package-json-update.tgz" "$DESTINATION/"
        else
            mv "${folder}_package-json-update.tgz" "$DESTINATION/"
        fi

   
    else
        echo "Directory $folder not found!"
    fi

    # Return to the original directory (Jenkins workspace)
    cd -
done

echo "Script execution completed!"
