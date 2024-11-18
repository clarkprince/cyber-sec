package tasks

import "log/slog"

// tech note: the loggers are intialized in the `init` function to make sure the syslog format is correctly detected

// AuditLogger should be used for any event that could require admin forensics
var AuditLogger *slog.Logger
