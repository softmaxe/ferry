VERSION = 1.0.0

CC         ?= clang
CFLAGS     ?= -O2
CFLAGS     += -Wall -Wextra -fno-objc-arc -arch arm64 \
              -mmacosx-version-min=26.0 -DFERRY_VERSION='"$(VERSION)"'
# AppKit is linked although no AppKit API is called: the window server ignores
# the bridged move operation from processes that have not loaded it.
FRAMEWORKS  = -framework AppKit -framework ApplicationServices \
              -F/System/Library/PrivateFrameworks -framework SkyLight

PREFIX ?= /usr/local
BIN     = build/ferry

.PHONY: all test install clean

all: $(BIN)

$(BIN): src/ferry.m Makefile
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $< -o $@ $(FRAMEWORKS)

test: $(BIN)
	tests/cli.sh $(BIN) $(VERSION)

install: $(BIN)
	install -d $(DESTDIR)$(PREFIX)/bin
	install -m 0755 $(BIN) $(DESTDIR)$(PREFIX)/bin/ferry

clean:
	rm -rf build
