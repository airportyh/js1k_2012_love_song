!function(){
    // note frequencies stored for reuse
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
      
    // Melody sections
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
        [4, ti*2],
        [1, dol],
        [1, ti*2],
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
    
    // Chords!
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
    
    var tracks = [notes, comp] // 2 tracks, melody and accompaniment
    
    var audio = new Audio()
      , sampleRate = 44100
      , trackCursors = [0, 0] // for each track, the index to the current note being played
      , currNoteDur = [] // This is to get at note duration info for the current notes being played
                         // to implement note envelope tapering
      , writePos = 0     // write position for the sample data
      , taper = 5000
      
    audio.mozSetup(1, sampleRate)

    function writeBits(){
        // toWrite is the amount to write to fill up our pre-buffer
        var toWrite = audio.mozCurrentSampleOffset() + sampleRate / 2 - writePos
        if (toWrite){
            var data = new Float32Array(toWrite)
            for (var i = 0; i < toWrite; i++, writePos++){
                for (var j = 0; j < 2; j++){
                    var cursor = trackCursors[j]
                      , currNote = tracks[j][cursor]
                    if (!currNote){ // no more notes to play
                        trackCursors[j] = 0 // return to of the track
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
                    data[i] += Math.sin(writePos * Math.PI * 2 * currNote[1] / sampleRate) * 0.3 *
                        ( // Note envelope tapering to prevent artifacts at note edges
                            (noteDur[0] < taper ? noteDur[0] / taper : 1) *
                            (noteDur[1] < taper ? noteDur[1] / taper : 1)
                        )
                }
            }
            audio.mozWriteAudio(data)
        }
        // Feed it data every 100ms
        setTimeout(writeBits, 100)
    }

    writeBits() // kick off the async loop

}()
