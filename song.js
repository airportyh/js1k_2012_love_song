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

function genEvents(notes, events){
    var pos = 0
      , pause = 0.25
    notes.forEach(function(note){
        var dur = note[0]
          , n = note[1]
        events.push([pos, n])
        events.push([pos + dur - pause, n])
        pos += dur
    })
}
function genChordEvents(chords, events){
    var pos = 0
      , pause = 0.25
    chords.forEach(function(chord){
        ![0,1,2,3,2,1,0,1,2,3,2,1].forEach(function(i){
            events.push([pos, chord[i]])
            events.push([pos + 1 - pause, chord[i]])
            pos++
        })
    })
}

function startSong(){
    var notes = [
        [11, 3],
        [1, 5],
        [12, 3],
        [1, 5],
        [1, 7],
        [9, 3],
        [1, 3],
        [8, -2],
        [1, -2],
        [2, 7],
        [1, 5],
        [11, 3],
        [1, 5],
        [9, 3],
        [2, -5],
        [1, -4],
        [23, -2],
        [1, -2]
    ]
    var events = []
    var I = [-9, -5, -2, 3]
      , VIII = [-12, -9, -5, 0]
      , IV = [-16, -12, -9, -4]
      , V = [-14, -10, -7, -2]
    var chords = [I, VIII, IV, V, I, VIII, V, V]
    chords = chords.concat(chords)
    genEvents(notes, events)
    genChordEvents(chords, events)
    events = events.sort(function(a, b){return a[0] - b[0]})
    processEvents(events, 60)
}    
window.startSong = startSong
}(Math)