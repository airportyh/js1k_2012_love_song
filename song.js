!function(Math){

var note2freq = [
440,
466.16,
493.88,
523.25,
554.37,
587.33,
622.25,
659.26,
698.46,
739.99,
789.99,
830.61
]

function freq4note(n){
    var freq = note2freq[n]
    if (n > 11)
        freq = note2freq[n % 12] * Math.pow(2, Math.floor(n / 12))
    if (n < 0){
        var n = Math.abs(n) - 1
        freq = note2freq[11 - (n % 12)] / Math.pow(2, Math.floor(n / 12) + 1)
    }
    return freq
}

function processEvents(orgEvents, tempo){
    var audio = new Audio()
      , sampleRate = 44100
      , currentNotes = []
      , bufferSize = sampleRate / 2
      , currWritePos = 0
      , events = orgEvents.slice(0)
      , eOffset = 0
    audio.mozSetup(1, sampleRate)

    function writeBits(){
        if (events.length === 0){
            events = orgEvents.slice(0)
            eOffset = -currWritePos
            currentNotes = []
        }
        var currPos = audio.mozCurrentSampleOffset()
          , toWrite = currPos + bufferSize - currWritePos
        if (toWrite > 0){
            var data = new Float32Array(toWrite)
            //console.log('toWrite: ' + toWrite + ' currWritePos: ' + currWritePos + ', events: ' + events.length)
            for (var i = 0; i < toWrite; i++, currWritePos++){
                var eventsToKeep = []
                for (var j = 0; j < events.length; j++){
                    var event = events[j]
                      , note = event[1]
                      , eventPos = event[0] / (tempo / 60) / 3 * sampleRate
                      , idx
                    if (eventPos <= (eOffset + currWritePos)){
                        if (-1 !== (idx = currentNotes.indexOf(note))){
                            //console.log('Note off ' + note)
                            currentNotes.splice(idx, 1)
                        }else{
                            //console.log('Note on ' + note)
                            currentNotes.push(note)
                        }
                    }else{
                        eventsToKeep.push(event)
                    }
                }
                events = eventsToKeep
                var freqs = currentNotes.map(freq4note)
                var value = freqs.reduce(function(sum, freq){
                    return Math.sin(currWritePos * Math.PI * 2 * freq / sampleRate) * 0.3 + sum
                }, 0)
                data[i] = value
            }
            audio.mozWriteAudio(data)
            //console.log('wrote ' + data.length + ' frames.')
        }
        setTimeout(writeBits, 100)
    }

    writeBits()
}

function startSong(){
    var events = [
        [0, 0],
        [1.75, 0],
        [2, 0],
        [2.75, 0],
        [3, 0],
        [5.75, 0],
        [6, 0],
        [7.75, 0],
        [8, 0],
        [10.75, 0],
        [11, 0],
        [13.75, 0],
        [14, -2],
        [16.75, -2],
        [17, -3],
        [19.75, -3],
        [20, -5],
        [20.75, -5],
        [21, -3],
        [23.75, -3],
        [24, 0],
        [25.75, 0],
        [26, 0],
        [26.75, 0],
        [27, 0],
        [29.75, 0],
        [30, 0],
        [31.75, 0],
        [32, 0],
        [34.75, 0],
        [35, 3],
        
        [37.75, 3],
        [38, 1],
        [40.75, 1],
        [41, 0],
        [43.75, 0],
        [44, -2],
        [46.75, -2],
        [47, 3],
        [52.75, 3],
        [53, -4],
        [53.75, -4],
        [54, 0],
        [55.75, 0],
        [56, 0],
        [58.75, 0],
        [59, -4],
        [61.75, -4],
        [62, -9],
        [62.75, -9],
        [63, -7],
        [64.75, -7],
        [65, -9],
        [65.75, -9],
        [66, -4],
        [67.75, -4],
        [68, -4],
        [70.75, -4],
        [71, 0],
        [84.75, 0],
        [86, 0],
        [87.75, 0],
        [88, -2],
        [90.75, -2],
        [91, -7],
        [91.75, -7],
        [92, -3],
        [94.75, 3]
    ]
    processEvents(events, 90)
}    
window.startSong = startSong
}(Math)