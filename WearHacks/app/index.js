var http = require('http'),
fs = require('fs');
var currentHit = 0;
var server = http.createServer(function(req, res) {
    //console.log(req.url);
    if(req.url == "/"){
    var globalWords = [];
    var globalTime = [];
    var syncTimeData = [];
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
                    time[i] = splitItems[1].split(" ")[3].split(":")[1];
                    if(splitItems[2].length > 4){
                        globalWords[gwIndex] = splitItems[2];
                        globalTime[gwIndex] = splitItems[0];

                        gwIndex +=1;
                    }
                    
                    if(i > 0){
                        if(time[i]-time[i-1] > 1 || time[i] - time[i-1] < 0){
                            paragraph += "\n\n" + splitItems[1] + "\t";
                        }
                    }
                    paragraph += words[i] + " ";
                }


	  	        data1 = data1.replace(/\%_jsData_\%/gi, paragraph);
                fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/text.txt', function(err, moodRawData){
                    if(err) console.log(err);
                    
                    var lines = moodRawData.toString().split("\n");
                    var jawData = [];
                    var timeData = [];
                    var jawIndex = 0;
                    for(i = 0; i < lines.length - 1; i ++){
                        var lineItems = lines[i].split(",");
                        if(lineItems[1].indexOf("jaw") > -1){
                            jawData[jawIndex] = lineItems[2].replace(" ","");
                            timeData[jawIndex] = lineItems[0]; 'to put to MS'
                            //syncTimeData[jawIndex] = lineItems[0] - 4*3600;
                            //console.log(Number(timeData[jawIndex]) + "      " + Number(jawData[jawIndex]));
                             jawIndex +=1;
                        }
                    }
                    var moodData = []
                    var moodTimeData = []
                    var moodIndex = 0;

                    lastRecord = timeData[0];
                    var partialSum = 0.0;
                    var terms = 0.0;
                    for(i = 0; i < timeData.length-1; i++){
                        partialSum = Number(partialSum) + Number(jawData[i]);
                        terms +=1;
                        if(timeData[i] - lastRecord > 1){
                            //console.log(partialSum + "    " + terms);
                            lastRecord = timeData[i];
                            moodData[moodIndex] = Math.max(1,10*partialSum/terms);
                            moodTimeData[moodIndex] = lastRecord;
                            //console.log(Number(moodTimeData[moodIndex]) + "     " + Number(moodData[moodIndex]));
                            moodIndex+=1;
                            partialSum = 0;
                            terms = 0;
                        }
                    }





                    var mood = [];    
                    var newWords = [];
                    var newWordIndex = 0;

                    //console.log("lol:" + globalWords.length);
                    for(i = 0; i < globalWords.length -1; i++){
                        newWords[newWordIndex] = globalWords[i];
                        var tempValue = getWordMoodAtTime(moodData, moodTimeData, globalTime[i]/1000);
                        if(tempValue != -1){
                            mood[newWordIndex] = getWordMoodAtTime(moodData, moodTimeData, globalTime[i]/1000);
                            newWordIndex +=1;
                        }else{

                        }
                        
                        //console.log(globalTime[i]);
                        //console.log(mood[newWordIndex]);

                    }
                    var bestWord = "";
                    var worstWord = "";
                    var maxMood = 0;
                    var minMood = 999999;
                    console.log("length: " + mood.length);
                    for(i = 0; i < mood.length-1; i++){
                        var tmpMood = 0;
                        var tmpWord = newWords[i];
                        var tmpCount = 0;
                        for(j = 0; j < newWords.length-1; j++){
                            if(newWords[j] == tmpWord){
                                tmpCount +=1;
                                tmpMood += mood[j];
                            }
                        }
                        console.log("word:" + tmpWord + "   mood" + tmpMood);
                        if(tmpCount > 0){
                            tmpMood = tmpMood/tmpCount;
                            if(tmpMood > maxMood){
                                maxMood = tmpMood;
                                bestWord = tmpWord;
                            }
                            if(tmpMood < minMood){
                                minMood = tmpMood;
                                worstWord = tmpWord;
                            }
                        }
                    }
                   

                    //console.log("mm: " + maxMood + "    " + bestWordCount);
                   

                    //Now we have the mood for each word. Go through and find the words that show up the most
                     var mostCommonWord = mode(newWords);
                     var avgMoodMCWord = 0;
                     var amountOfTimes = 0;
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == mostCommonWord){
                            avgMoodMCWord += mood[i];
                            
                            amountOfTimes +=1
                            newWords[i] = i;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodMCWord = avgMoodMCWord/amountOfTimes;
                    }
                    //console.log(newWords);
                    var secondMostCommonWord = mode(newWords);
                    if(secondMostCommonWord == "0"){
                        secondMostCommonWord = newWords[1];
                    }
                    //console.log("hello: " + secondMostCommonWord);
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
                    if(thirdMostCommonWord.length = 1){
                        thirdMostCommonWord = newWords[2];
                    }
                    var avgMoodTMCWord = 0;
                    amountOfTimes = 0;
                    //console.log(amountOfTimes);
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == thirdMostCommonWord){
                            avgMoodTMCWord += mood[i];
                            
                            amountOfTimes +=1
                            newWords[i] = i;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodTMCWord = avgMoodTMCWord/amountOfTimes;
                     }

                    var fourthMostCommonWord = mode(newWords);
                    if(fourthMostCommonWord.length = 1){
                        fourthMostCommonWord = newWords[3];
                    }
                    var avgMoodFMCWord = 0;
                    amountOfTimes = 0;
                     for(i = 0; i < newWords.length-1; i++){
                        if(newWords[i] == fourthMostCommonWord){
                            avgMoodFMCWord += mood[i];
                            //console.log(avgMoodFMCWord);
                            amountOfTimes +=1
                            newWords[i] = i;
                        }
                     }
                     //console.log(amountOfTimes);
                     if(amountOfTimes > 0){
                        avgMoodFMCWord = avgMoodFMCWord/amountOfTimes;
                     }

                    //console.log("2nd" + secondMostCommonWord);
                    var wordsDataToDisplay = "[";
                     var wordsToDisplay = "['";
                     if(mostCommonWord == bestWord || mostCommonWord == worstWord){
                     }else{
                        wordsToDisplay += mostCommonWord.replace("'",",") + "','";
                        wordsDataToDisplay +=avgMoodMCWord + ","; 
                     }
                     if(secondMostCommonWord == bestWord || secondMostCommonWord == worstWord){
                     }else{
                        wordsToDisplay += secondMostCommonWord.replace("'",",") + "','";
                        wordsDataToDisplay += avgMoodSMCWord + ",";
                     }
                     if(thirdMostCommonWord == bestWord || thirdMostCommonWord == worstWord){
                     }else{
                        wordsDataToDisplay += avgMoodTMCWord + ",";
                        wordsToDisplay += thirdMostCommonWord.replace("'",",") + "','"; 
                     }
                    if(fourthMostCommonWord == bestWord || fourthMostCommonWord == worstWord){
                    }else{
                        wordsToDisplay += fourthMostCommonWord.replace("'",",") + "','";
                        wordsDataToDisplay += avgMoodFMCWord + ",";
                    }
                     
                        wordsDataToDisplay += maxMood + ",";
                    wordsDataToDisplay += minMood + "]";
                     
                     wordsToDisplay += bestWord.replace("'",",") + "','";
                     wordsToDisplay += worstWord.replace("'", ",") + "']";

                     console.log(wordsToDisplay);
                     data1 = data1.replace(/\%_wordsToDisplay_\%/gi, wordsToDisplay);
                     
                     
                     console.log(wordsDataToDisplay);
                     data1 = data1.replace(/\%_wordsDataToDisplay_\%/gi, wordsDataToDisplay.toString());

                    fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/PRESSURE.log', function(err, presData) {
                        if(err) console.log(err);
            
                        var lines = presData.toString().split("\n"),
                            pressures = [],
                            times = [],
                            seriesData = false;
                        var badPoints = 0;
                        for(i = 0; i < lines.length-1; i++){
                            var splitItems = lines[i].split(";");
                            pressures[i] = splitItems[1];
                            //console.log("time: " + splitItems[0]);
                            times[i] = convertTimeToLongTime(splitItems[0]); //.split(" ")[1]
                            var moodValue = getMoodAtTime(moodData,moodTimeData,times[i]/100);
                            if(moodValue != -1){
                               seriesData = ((seriesData) ? seriesData + ",[" : "[[") + Number(pressures[i]) + "," + Number(moodValue) + "]";
                            }else{
                                //console.log("god a bad press point");
                                badPoints +=1;
                            }
                        }
                        console.log("total bad press: " + badPoints + "   total points: " + (lines.length -1 - badPoints));
                        seriesData +="]";
                        //console.log(seriesData);
                        data1 = data1.replace(/\%_pressureSeriesData_\%/gi, seriesData);
                        fs.readFile('/Users/StephenPoole/Dropbox/Speech\ and\ Mood\ Recorder\ Data/TEMP.log', function(err, tempData){
                            if(err) console.log(err);

                            var lines = tempData.toString().split("\n"),
                                temperatures = [],
                                times = [],
                                seriesData = false;
                            var badPoints = 0;
                            for(i = 0; i < lines.length-1; i++){
                                var splitItems = lines[i].split(";");
                                temperatures[i] = splitItems[1];
                                times[i] = convertTimeToLongTime(splitItems[0]); //.split(" ")[1];
                                var moodValue = getMoodAtTime(moodData, moodTimeData, times[i]/100);
                                if(moodValue != -1){
                                    seriesData = ((seriesData) ? seriesData + ",[" : "[[") + Number(temperatures[i]) + "," + Number(moodValue) + "]";
                                }else{
                                    //console.log("got a bad temp point");
                                    badPoints+=1;
                                }
                            }
                            console.log("total bad temp: " + badPoints + "    total points: " + (lines.length-1-badPoints));
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
    for(var k = 0; k < array.length; k++)
    {
        var el = array[k];
        
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
function getMoodAtTime(moodData, moodTimeData, time)
{
    var min = 999999;
    var value = 0;
    //console.log("mt:" + moodTimeData + "     t:" + time);
    for(j = 0; j < moodTimeData.length -1; j++){
        if(moodTimeData[j]-4*3600 - time < min){
            min = Math.abs(moodTimeData[j]-4*3600 - time);
            value = moodData[j];
        }
    }
    if(min > 100){
        value = -1;
    }
    //console.log("min: " + min);

    return value;
}
function getWordMoodAtTime(moodData, moodTimeData, time)
{
    var min = 999999;
    var value = 0;
    //console.log("mt:" + moodTimeData + "     t:" + time);
    for(j = 0; j < moodTimeData.length -1; j++){
        if(moodTimeData[j] - time < min){
            min = Math.abs(moodTimeData[j] - time);
            value = moodData[j];
        }
    }
    if(min > 100){
        value = -1;
    }
    //console.log("min: " + min);

    return value;
}
function convertTimeToLongTime(dateTime){
    var ymd = dateTime.split(" ")[0].split("-");
    var year = ymd[0];
    var month = ymd[1];
    var day = ymd[2];
    var hms = dateTime.split(" ")[1].split(":");
    var hour = hms[0];
    var minute = hms[1];
    var second = hms[2];
    //console.log(day + "   " + hour + "   " + minute + "   " + second );
    var timeInLong = 1431216000; //Takes us to May 10th (TODAY)
    timeInLong += (day - 10)*3600*24;
    timeInLong += hour*3600;
    timeInLong += minute*60;
    timeInLong += second;
    return timeInLong;
}
