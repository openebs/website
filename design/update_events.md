## Add a new  event


* Go to ``website/src/resources/events.json`` and make the new entry in the `events.json` file by adding another json object literal after the last event.
* Format for a scheduled future  event is as follows

```
{
       "id":  Next consecutive number to the id of the last event (+ve number),
       "date": "Date of commencement of the event in yyyy-mm-dd format",
       "title": "Event name",
       "description": "Description of the event",      
       "buttonText": "Register",
       "buttonLink": "Link to register"
}
```

* Format for a recurring  event is as follows

```
{
       "id":  Next consecutive number to the id of the last event (+ve number),
       "date": "Every Tuesday",
       "title": "Event name",
       "description": "Description of the event",      
       "buttonText": "Register",
       "buttonLink": "Link to register"
}
```