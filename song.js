function play(){
    
    var dol = 523.25
      , re = 587.33
      , mi = 659.26
      , so = 394.995
      , fa = 349.23
      , la_ = 220
      , ti = 246.94
      , mi_ = mi / 2
      , dol_ = dol / 2
      , la = la_ * 2
      
    var notes = [
        [11, dol],
        [1, re],
        [12, dol],
        [1, re],
        [1, mi],
        [9, dol],
        [1, dol],
        [8, so],
        [1, so],
        [2, mi],
        [1, re],
        [11, dol],
        [1, re],
        [9, dol],
        [2, mi_],
        [1, fa],
        [23, so],
        [1, so]
    ]
    
    var I = [dol_, mi_, so, mi_]
      , VIII = [la_, dol_, mi_, la]
      , IV = [fa/2, la_, dol_, fa]
      , V = [so/2, ti, re/2, ti]
    var chords = [I, VIII, IV, V, I, VIII, V, V]
    var comp = []
    chords.forEach(function(chord){
        [0,1,2,3,2,1,0,1,2,3,2,1].forEach(function(i){
            comp.push([1, chord[i]])
        })
    })
    
    var tracks = [notes, comp]
    
    var audio = new Audio()
      , sampleRate = 44100
      , trackCursors = [0, 0]
      , currNoteDur = []
      , bufferSize = sampleRate / 2
      , writePos = 0
      , done = false
      
    audio.mozSetup(1, sampleRate)

    function writeBits(){
        var toWrite = audio.mozCurrentSampleOffset() + bufferSize - writePos
        if (toWrite > 0){
            var data = new Float32Array(toWrite)
            for (var i = 0; i < toWrite; i++, writePos++){
                var value = 0
                for (var j = 0; j < 2; j++){
                    var cursor = trackCursors[j]
                    var currNote = tracks[j][cursor]
                    if (!currNote){
                        trackCursors[j] = 0
                        continue
                    }
                    var freq = currNote[1]
                    var noteDur = currNoteDur[j]
                    if (noteDur == null){
                        noteDur = currNoteDur[j] = [0, currNote[0] * sampleRate / 3]
                    }else if (noteDur[1] === 0){
                        trackCursors[j]++
                        currNoteDur[j] = null
                        break
                    }else{
                        currNoteDur[j][1]--
                        currNoteDur[j][0]++
                    }
                    value += Math.sin(writePos * Math.PI * 2 * freq / sampleRate) * 0.3 *
                        (
                            (noteDur[0] < 2000 ? noteDur[0] / 2000 : 1) *
                            (noteDur[1] < 8000 ? noteDur[1] / 8000 : 1)
                        )
                        
                }
                data[i] = value
            }
            audio.mozWriteAudio(data)
        }
        setTimeout(writeBits, 100)
    }

    writeBits()
}
