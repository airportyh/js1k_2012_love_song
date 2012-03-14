!function(){
    var processEvents = function(orgEvents){
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
                      , eventPos = event[0] / 3 * sampleRate
                      , idx
                    if (eventPos <= (eOffset + currWritePos)){
                        if (-1 !== (idx = currentNotes.indexOf(note)))
                            currentNotes.splice(idx, 1)
                        else
                            currentNotes.push(note)
                        events.shift()
                    }
                    var value = currentNotes.reduce(function(sum, freq){
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
        notes.forEach(function(note){
            var dur = note[0]
              , n = note[1]
            events.push([pos, n])
            events.push([pos + dur - 0.25, n])
            pos += dur
        })
    }
    function genChordEvents(chords, events){
        var pos = 0
        chords.forEach(function(chord){
            ![0,1,2,3,2,1,0,1,2,3,2,1].forEach(function(i){
                events.push([pos, chord[i]])
                events.push([pos + 1 - 0.25, chord[i]])
                pos++
            })
        })
    }

    var dol = 523.25
      , re = 587.33
      , mi = 659.26
      , so = 394.995
      , fa = 349.23
      , la_ = 220
      , ti = 246.94
      , re_ = re / 2
      , mi_ = mi / 2
      , dol_ = dol / 2
      , la = la_ * 2
      , fa_ = fa / 2
      , so_ = so / 2
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
    var events = []
    var I = [dol_, mi_, so, mi_]
      , VIII = [la_, dol_, mi_, la]
      , IV = [fa_, la_, dol_, fa]
      , V = [so_, ti, re_, ti]
    var chords = [I, VIII, IV, V, I, VIII, V, V]
    genEvents(notes, events)
    genChordEvents(chords, events)
    events = events.sort(function(a, b){return a[0] - b[0]})
    processEvents(events)
}()
