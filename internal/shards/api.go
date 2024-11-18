package shards

type Pattern string
type Shard string

type Sharded interface {
	ShardPattern() string
}
