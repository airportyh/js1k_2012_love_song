!function(){
    var dol = 523.25
      , re = 587.33
      , mi = 659.26
      , so = 394.995
      , fa = 349.23
      , mib = 311.13
      , la_ = 220
      , ti = 246.94
      , mi_ = mi / 2
      , dol_ = dol / 2
      , la = la_ * 2
      
    var sectionA = [
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
        [24, so]
    ]
    
    var sectionB = [
        [2, fa],
        [2, so],
        [1, la],
        [1, dol],
        [4, ti],
        [1, dol],
        [1, ti],
        [4, la],
        [1, fa],
        [1, la],
        [6, so],
        [2, fa],
        [2, so],
        [1, la],
        [1, dol],
        [4, re],
        [1, re],
        [1, dol],
        [1, mi],
        [11, so*2]
    ]
    
    var notes = [].concat(sectionA, sectionB, sectionB, sectionA)
    
    var I = [dol_, mi_, so, mi_]
      , VIII = [la_, dol_, mi_, la]
      , IV = [fa/2, la_, dol_, fa]
      , V = [so/2, ti, re/2, ti]
    
    var compA = [I, I, VIII, VIII, IV, IV, V, V, I, I, VIII, VIII, V, V, V, V]
      , compB = [IV, V, IV, V, IV, V, I, I]
      , comp = []
    ![].concat(compA, compB, compB, compA).forEach(function(chord){
        [0,1,2,3,2,1].forEach(function(i){
            comp.push([1, chord[i]])
        })
    })
    
    var tracks = [notes, comp]
    
    var audio = new Audio()
      , sampleRate = 44100
      , trackCursors = [0, 0]
      , currNoteDur = []
      , writePos = 0
      , taper = 5000
      
    audio.mozSetup(1, sampleRate)

    function writeBits(){
        var toWrite = audio.mozCurrentSampleOffset() + sampleRate / 2 - writePos
        if (toWrite){
            var data = new Float32Array(toWrite)
            for (var i = 0; i < toWrite; i++, writePos++){
                for (var j = 0; j < 2; j++){
                    var cursor = trackCursors[j]
                      , currNote = tracks[j][cursor]
                    if (!currNote){
                        trackCursors[j] = 0
                        continue
                    }
                    var noteDur = currNoteDur[j]
                    if (!noteDur){
                        noteDur = currNoteDur[j] = [0, currNote[0] * sampleRate / 3]
                    }else if (!noteDur[1]){
                        trackCursors[j]++
                        currNoteDur[j] = null
                        break
                    }else{
                        noteDur[1]--
                        noteDur[0]++
                    }
                    data[i] += Math.sin(writePos * Math.PI * 2 * currNote[1] / sampleRate) * 0.5 *
                        (
                            (noteDur[0] < taper ? noteDur[0] / taper : 1) *
                            (noteDur[1] < taper ? noteDur[1] / taper : 1)
                        )
                }
            }
            audio.mozWriteAudio(data)
        }
        setTimeout(writeBits, 100)
    }

    writeBits()

}()
