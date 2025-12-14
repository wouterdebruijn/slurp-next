# Example Payloads KPN

# Device Online

```json
[
  {
    "bn": "urn:dev:DEVEUI:0059AC00001B3461:",
    "bt": 1.76573996026e9,
    "n": "locOrigin",
    "vs": "KPNLORA"
  },
  { "n": "latitude", "u": "lat", "v": 52.266785 },
  { "n": "longitude", "u": "lon", "v": 4.630842 },
  { "n": "radius", "u": "m", "v": 356.820465 },
  { "n": "locMethod", "vs": "TDOA" },
  { "n": "locAccuracy", "u": "%", "v": 9999.0 },
  { "n": "locPrecision", "u": "%", "v": 9999.0 },
  { "n": "locTime", "u": "s", "v": 1.76573996026e9 }
]
```

# Device Payload

```json
[
  {
    "bn": "urn:dev:DEVEUI:0059AC00001B3461:",
    "bt": 1.765739955219e9,
    "n": "payload",
    "vs": "763d0028" // Payload id mapped as unint8 array with buffers per changed tag. 4 bytes ID and 4 bytes value (id: 0x763d, value: 0x0028 [40 "ml"])
  },
  { "n": "port", "v": 1.0 },
  { "n": "FCntUp", "v": 0.0 },
  { "n": "FCntDn", "v": 1.0 },
  { "n": "LrrRSSI", "v": -107.0 },
  { "n": "LrrSNR", "v": 3.0 },
  { "n": "LrrESP", "v": -108.764351 },
  { "n": "DevLrrCnt", "v": 2.0 },
  { "n": "SpFact", "v": 8.0 },
  { "n": "SubBand", "vs": "G1" },
  { "n": "Channel", "vs": "LC3" },
  { "n": "ADRbit", "v": 1.0 },
  { "n": "timeOrigin", "vs": "NETWORK" }
]
```
