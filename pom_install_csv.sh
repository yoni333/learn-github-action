#!/bin/bash

# Path to the CSV file
CSV_FILE="pom-update.csv"

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "CSV file not found!"
    exit 1
fi

# Extract the first column and save it into a variable
# Use awk to extract unique values from the first column
FOLDERS=$(awk -F, '!seen[$1]++ {print $1}' "$CSV_FILE")

# Print the unique folder names
echo "$FOLDERS"

# Jenkins provides a WORKSPACE environment variable
WORKSPACE_PATH=$WORKSPACE

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
        echo "Running meaven install in $folder"
        # Run meaven install with fail never flag -fn
        mvn -B clean install -DskipTests -Dspring-boot.repackage.skip=true -fn
        mkdir pom_dependencies
        mvn dependency:copy-dependencies -DoutputDirectory="$WORKSPACE_PATH/$FOLDER_NAME/$folder/pom_dependencies"

        # Check if meaven install was successful
        if [ $? -ne 0 ]; then
            echo "meaven install failed in $folder"
            exit 1
        fi

        
        # Zip the folder with its updated package.json and the npm-packages directory
        echo "Zipping the folder $folder"
        
        # Define the folder name and store it in a variable
        zip_folder="zip_for_halbana"

        # Check if the folder exists; if not, create it
        if [ ! -d "$zip_folder" ]; then
            mkdir "../$zip_folder"
        fi
        # zip the pom_dependencies folder
        tar -czvf "${folder}_pom_dependencies.tgz"  "$./$folder/pom_dependencies/" pom-update.csv
        # Move files to the specified folder
        echo "move the tgz file to root folder"
        mv "${folder}_pom_dependencies.tgz" "../$zip_folder/"

         # zip the pom_dependencies_m2 folder
        tar -czvf "${folder}_pom_dependencies_m2.tgz" ~/.m2 pom-update.csv
        # Move files to the specified folder
        echo "move the tgz file to root folder"
        mv "${folder}_pom_dependencies_m2.tgz" "../$zip_folder/"

        #clean 
        rm -r pom_dependencies
    else
        echo "Directory $folder not found!"
    fi

    # Return to the original directory (Jenkins workspace)
    cd -
done

echo "Script execution completed!"
