import wave, struct, pdb

f = wave.open('snippet.wav', 'r')
print '[',
length = f.getnframes()
rate = f.getframerate()
for i in xrange(0, length):
    wd = f.readframes(1)
    d1 = struct.unpack('<h', wd[:2])
    print int(d1[0]), ',',
        
print ']'