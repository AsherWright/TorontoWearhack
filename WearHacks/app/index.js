var http = require('http'),
fs = require('fs');
var currentHit = 0;
var server = http.createServer(function(req, res) {
    //console.log(req.url);
    if(req.url == "/"){
    var globalWords = [];
    var gwIndex = 0;
	   res.writeHead(200);
	   currentHit++;
	   fs.readFile('/Users/StephenPoole/Documents/Hackathons/TO/TorontoWearhack/WearHacks/app/index.html', function(err, data1) {
	       if(err) console.log(err);
	  	        data1 = data1.toString();
	       fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/wearableData.txt', function(err, wordData) {
	  	        if(err) console.log(err);
                var lines = wordData.toString().split("\n");
                var words = []
                var time = []
                var splitItems = lines[0].split("\t");
                var paragraph = splitItems[1] + "\t";
                for(i = 1; i < lines.length-1; i++){
                    splitItems = lines[i].split("\t");
                    words[i] = splitItems[2];
                    if(splitItems[2].length > 4){
                        globalWords[gwIndex] = splitItems[2];
                        gwIndex +=1;
                    }
                    time[i] = splitItems[1].split(" ")[3].split(":")[1];
                    if(i > 0){
                        if(time[i]-time[i-1] > 1 || time[i] - time[i-1] < 0){
                            paragraph += "\n" + splitItems[1] + "\t";
                        }
                    }
                    paragraph += words[i] + " ";
                }


	  	        data1 = data1.replace(/\%_jsData_\%/gi, paragraph);
                fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/PRESSURE.log', function(err, moodData){
                    if(err) console.log(err);
                    var mood = [];    
                    var newWords = [];
                    var newWordIndex = 0;
                    for(i = 0; i < globalWords.length-1; i++){
                        newWords[newWordIndex] = globalWords[i];
                        mood[newWordIndex] = Math.random()*10;
                        newWordIndex +=1;
                    }

                    //Now we have the mood for each word. Go through and find the words that show up the most
                     var mostCommonWord = mode(newWords);
                     var avgMoodMCWord = 0;
                     var amountOfTimes = 0;
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == mostCommonWord){
                            avgMoodMCWord += mood[i];
                            
                            amountOfTimes +=1
                            newWords[i] = i*2.5;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodMCWord = avgMoodMCWord/amountOfTimes;
                    }

                    var secondMostCommonWord = mode(newWords);
                    var avgMoodSMCWord = 0;
                    amountOfTimes = 0;
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == secondMostCommonWord){
                            avgMoodSMCWord += mood[i];
                            
                            amountOfTimes +=1
                            newWords[i] = i;
                        }
                     }
                    // console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodSMCWord = avgMoodSMCWord/amountOfTimes;
                     }

                    var thirdMostCommonWord = mode(newWords);
                    var avgMoodTMCWord = 0;
                    amountOfTimes = 0;
                    //console.log(amountOfTimes);
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == thirdMostCommonWord){
                            avgMoodTMCWord += mood[i];
                            
                            amountOfTimes +=1
                            newWords[i] = i*1.5;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodTMCWord = avgMoodTMCWord/amountOfTimes;
                     }

                    var fourthMostCommonWord = mode(newWords);
                    var avgMoodFMCWord = 0;
                    amountOfTimes = 0;
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == fourthMostCommonWord){
                            avgMoodFMCWord += mood[i];
                            console.log(avgMoodFMCWord);
                            amountOfTimes +=1
                            newWords[i] = i*1.7;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodFMCWord = avgMoodFMCWord/amountOfTimes;
                     }


                     var wordsToDisplay = "['" + mostCommonWord.replace("'",",") + "','" + secondMostCommonWord.replace("'",",") + "','" + thirdMostCommonWord.replace("'",",") + "','" + fourthMostCommonWord.replace("'",",") + "']";
                     console.log(wordsToDisplay);
                     data1 = data1.replace(/\%_wordsToDisplay_\%/gi, wordsToDisplay);
                     
                     var wordsDataToDisplay = "[" + avgMoodMCWord + "," + avgMoodSMCWord + "," + avgMoodTMCWord + "," + avgMoodFMCWord + "]";
                     console.log(wordsDataToDisplay);
                     data1 = data1.replace(/\%_wordsDataToDisplay_\%/gi, wordsDataToDisplay.toString());

                    fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/PRESSURE.log', function(err, presData) {
                        if(err) console.log(err);
            
                        var lines = presData.toString().split("\n"),
                            pressures = [],
                            times = [],
                            seriesData = false;

                        for(i = 0; i < lines.length-1; i++){
                            var splitItems = lines[i].split(";");
                            pressures[i] = splitItems[1];
                            times[i] = splitItems[0].split(" ")[1];
                            var moodValue = Math.random() * (10)
                            seriesData = ((seriesData) ? seriesData + ",[" : "[[") + Number(pressures[i]) + "," + Number(moodValue) + "]";
                        }
                        seriesData +="]";
                        //console.log(seriesData);
                        data1 = data1.replace(/\%_pressureSeriesData_\%/gi, seriesData);
                        fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/TEMP.log', function(err, tempData){
                            if(err) console.log(err);

                            var lines = tempData.toString().split("\n"),
                                temperatures = [],
                                times = [],
                                seriesData = false;

                            for(i = 0; i < lines.length-1; i++){
                                var splitItems = lines[i].split(";");
                                temperatures[i] = splitItems[1];
                                times[i] = splitItems[0].split(" ")[1];
                                var moodValue = Math.random() * 1
                                seriesData = ((seriesData) ? seriesData + ",[" : "[[") + Number(temperatures[i]) + "," + Number(-i/20 + 7) + "]";
                            }
                            seriesData += "]";
                            //console.log(seriesData);
                            data1 = data1.replace(/\%_tempSeriesData_\%/gi, seriesData);
                            res.write(data1);
                            res.end();
                        });
                    });
                });
            });
	   });
  }else{
  		  fs.readFile('/Users/StephenPoole/Documents/Hackathons/TO/TorontoWearhack/WearHacks/app/Website' + req.url, function(err, data3) {
	  	if(err){
	  		console.log(err);
	  	}
	  	
	  	res.write(data3);
	  	res.end();
	  });

  }

});
server.listen(8080);

function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
            
            if(modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;  
            if(modeMap[el] > maxCount)
            {
                maxEl = el;
                maxCount = modeMap[el];
            }
        
    }
    return maxEl;
}
