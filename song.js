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
                var event = events[0]
                if (!event) break
                var note = event[1]
                  , eventPos = event[0] / (tempo / 60) / 3 * sampleRate
                  , idx
                if (eventPos <= (eOffset + currWritePos)){
                    if (-1 !== (idx = currentNotes.indexOf(note)))
                        currentNotes.splice(idx, 1)
                    else
                        currentNotes.push(note)
                    events.shift()
                }
                var value = currentNotes.map(freq4note).reduce(function(sum, freq){
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
    var notes = [
        [1, -7],
        [3, -3],
        [2, 0],
        [1, 0],
        [3, 0],
        [2, 0],
        [3, 0],
        [3, 0],
        [3, -2],
        [3, -3],
        [1, -5],
        [3, -3],
        [2, 0],
        [1, 0],
        [3, 0],
        [2, 0],
        [3, 0],
        [3, 3],
        [3, 1],
        [3, 0],
        [6, 3],
        [1, 0],
        [2, 3],
        [3, 0],
        [3, -4],
        [1, -9],
        [2, -7],
        [1, -9],
        [2, -4],
        [3, -3],
        [14, 0],
        [2, 0],
        [3, -2],
        [1, -7],
        [3, -3]
    ]
    processEvents(genEvents(notes), 90)
}    
window.startSong = startSong
}(Math)