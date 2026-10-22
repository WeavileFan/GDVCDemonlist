# The official GDVC GDPS Demonlist  
GDVC is a small Geometry Dash Discord server that now has it's own official GDPS! This site serves as the Demonlist for the GDPS.  
## How to edit the list
If you have been granted permission by Weavile (me), you can edit the list. This means you can add records and new levels.  
### Adding a new level  
When a new Demon gets rated, Navigate to the data folder and create a new file  
![datafolder](https://files.catbox.moe/d7linw.png)  
Name the file (levelname).json, and paste the code below into it  
```
{
    "id": #,
    "name": "#",
    "author": "#",
    "creators": ["#"],
    "verifier": "#",
    "clickMethod": "#",
    "verification": "#",
    "percentToQualify": 50,
    "enjoyment": "#/10",
    "password": "Copyable",
    "popupIDs": [
        {
            "id": #,
            "text": "Allowed (Default)"
        }
    ],
}
```
Now, follow these steps carefully.  
1. Replace the # on line 2 with the level id
2. Replace the # on line 3 with the publisher of the level
3. Replace the # on line 3 with every creator of the level (separated with commas)
4. Replace the # on line 4 with "Click Between Frames" or “Click on Steps”
5. Replace the # on line 5 with the verification video
6. Replace the # on line 7 with the enjoyment rating
7. Replace the # on line 11 with the level ID (again)
   
After that, your code should look something like this:
```
{
    "id": 105,
    "name": "Dark Dragon Fire",
    "author": "Strdeh",
    "creators": ["Strdeh"],
    "verifier": "Strdeh",
    "clickMethod": "Click Between Frames",
    "verification": "https://www.youtube.com/watch?v=6LD9C1D01pA",
    "percentToQualify": 50,
    "enjoyment": "4/10",
    "password": "Copyable",
    "popupIDs": [
        {
            "id": 105,
            "text": "Allowed (Default)"
        }
    ],
}
```
