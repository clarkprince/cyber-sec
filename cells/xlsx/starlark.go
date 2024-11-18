package xlsx

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/fxamacker/cbor/v2"
	"trout.software/kraken/webapp/hub/storage"
	"trout.software/kraken/webapp/internal/sqlite"
	"trout.software/kraken/webapp/internal/sqlite/stability"
)

type Starlark struct {
	_ stability.SerializedValue

	Name        string
	Script      []byte
	DateCreated time.Time
	Shasum      string
}

type unzippedscript struct {
	name    string
	content []byte
	path    string
}

func UploadScripts(pool *sqlite.Connections, data []byte, shasum string) error {
	targetFolders := []string{"scripts", "libs"}
	err := unzip(data, targetFolders, func(uz unzippedscript) error {
		s := Starlark{}
		s.Name = uz.name
		s.Script = uz.content
		s.DateCreated = time.Now()
		s.Shasum = shasum

		return storage.PutValue(context.Background(), pool, fmt.Sprintf("/starlark_userscript/%s/%s", uz.path, s.Name), s)
	})
	if err != nil {
		return err
	}

	return nil
}

func unzip(data []byte, targetFolders []string, processFile func(unzippedscript) error) error {
	zipReader := bytes.NewReader(data)
	zipFile, err := zip.NewReader(zipReader, int64(len(data)))
	if err != nil {
		return err
	}

	for _, file := range zipFile.File {
		// check if it's a directory
		if file.FileInfo().IsDir() {
			continue
		}

		// check if it's in a target folder
		inTargetFolder := false
		var targetFolder string
		for _, folder := range targetFolders {
			if strings.Contains(file.Name, folder+"/") {
				inTargetFolder = true
				targetFolder = folder
				break
			}
		}

		if !inTargetFolder {
			continue
		}

		zipFile, err := file.Open()
		if err != nil {
			return fmt.Errorf("reading file %s: %w", file.FileHeader.Name, err)
		}

		content, err := io.ReadAll(zipFile)
		if err != nil {
			return fmt.Errorf("reading file %s: %w", file.FileHeader.Name, err)
		}

		uz := unzippedscript{content: content, path: targetFolder, name: filepath.Base(file.Name)}
		// process the file
		if err := processFile(uz); err != nil {
			return fmt.Errorf("reading file %s: %w", file.FileHeader.Name, err)
		}

		if err := zipFile.Close(); err != nil {
			return fmt.Errorf("closing file %s: %w", file.FileHeader.Name, err)
		}
	}

	return nil
}

func (s Starlark) MarshalBinary() ([]byte, error) {
	type W Starlark
	return cbor.Marshal(W(s))
}

func (s *Starlark) UnmarshalBinary(dt []byte) error {
	type W Starlark
	var w W
	if err := cbor.Unmarshal(dt, &w); err != nil {
		return err
	}
	*s = Starlark(w)
	return nil
}
