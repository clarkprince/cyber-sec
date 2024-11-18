package streams

import (
	"io"

	"trout.software/kraken/webapp/internal/features"
)

var UseStreamDetection = features.HasFlag("stream-detection")

type Stream interface {
	Offset() chan int64 //it receives a write event, opens the file, sends the block offset
	DownloadAt(offset int64, n int64, dst io.WriterAt, dstOffset int64) error
	GetTargetFileName() string
}
