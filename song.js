var audio = new Audio()
var sampleRate = 44100
audio.mozSetup(1, sampleRate)

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

function playNotes(notes){
    var totalDurationSeconds = notes.reduce(function(curr, item){
        return item[1] + curr
    }, 0) / 1000
    console.log('total duration: ' + totalDurationSeconds)
    var buffer = new Float32Array(sampleRate * totalDurationSeconds)
      , offset = 0
    notes.forEach(function(note){
        var freq = freq4note(note[0])
          , length = note[1] * sampleRate / 1000
        for (var i = 0; i < length; i++){
            var value = Math.sin(offset + i * Math.PI * 2 * freq / sampleRate) * 0.3
            if (i >= length - 2000)
                buffer[offset + i] = 0
            else
                buffer[offset + i] = value
        }
        offset += i
    })
    console.log('writing audio ' + buffer.length)
    console.log((buffer.length / sampleRate) + ' seconds')
    audio.mozWriteAudio(buffer)
}

function startSong(){
    var notes = [
        [0, 500],
        [0, 1000],
        [-3, 3500],
        [0, 500],
        [-1, 3500],
        [-5, 500],
        [-1, 1000],
        [0, 4000],
        [0, 500],
        [0, 1000],
        [-3, 3500],
        [0, 500],
        [-1, 3500],
        [-5, 500],
        [-3, 1000],
        [-8, 4000]
        
    ]
    playNotes(notes)
}
