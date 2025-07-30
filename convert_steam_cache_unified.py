#!/usr/bin/env python3
"""
Unified Steam Cache Data Converter
Converts both IPv4 and IPv6 Steam cache data from text format to JSON format
"""

import re
import json
import sys
from pathlib import Path

def parse_steam_cache_file(file_path, ip_version):
    """
    Parse Steam cache data file and convert to JSON format
    """
    entries = []
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split content into individual route entries
    # Each entry starts with @ or * followed by IP prefix
    route_blocks = re.split(r'\n(?=[@*]\s+[\da-fA-F:\.]+/\d+)', content)
    
    for block in route_blocks:
        if not block.strip():
            continue
            
        # Skip header lines (lines starting with # or containing summary info)
        if block.startswith('#') or 'destinations' in block or 'routes' in block:
            continue
        
        entry = parse_route_block(block, ip_version)
        if entry:
            entries.append(entry)
    
    return entries

def parse_route_block(block, ip_version):
    """
    Parse a single route block and extract relevant information
    """
    lines = block.strip().split('\n')
    
    # Extract IP prefix from first line
    # Handle both IPv4 and IPv6 formats
    if ip_version == 'v4':
        prefix_match = re.search(r'[@*]\s+(\d+\.\d+\.\d+\.\d+/\d+)', lines[0])
    else:  # v6
        prefix_match = re.search(r'[@*]\s+([\da-fA-F:]+/\d+)', lines[0])
    
    if not prefix_match:
        return None
    
    prefix = prefix_match.group(1)
    
    # Initialize entry
    entry = {
        "prefix": prefix,
        "aspath": "",
        "communities": []
    }
    
    # Parse BGP information
    for line in lines:
        line = line.strip()
        
        # Extract AS path
        aspath_match = re.search(r'AS path:\s*\[(\d+)\]\s*(.+?)\s*[IE?](\s*\(Atomic\))?$', line)
        if aspath_match:
            # Use the full AS path after the bracket
            entry["aspath"] = aspath_match.group(2).strip()
            if entry["aspath"] == "18041":
                entry["aspath"] = ""
        
        # Extract communities
        communities_match = re.search(r'Communities:\s*(.+)', line)
        if communities_match:
            communities_str = communities_match.group(1)
            # Split communities by space and clean up
            all_communities = [comm.strip() for comm in communities_str.split() if comm.strip()]
            # Filter communities to only include 18041: or target:18041
            filtered_communities = [
                comm for comm in all_communities 
                if comm.startswith('18041:') or comm.startswith('target:18041')
            ]
            entry["communities"] = filtered_communities
    
    return entry

def save_json(data, output_path):
    """
    Save data to JSON file
    """
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
    
    print(f"Converted {len(data)} entries to {output_path}")

def convert_file(input_file, output_file, ip_version):
    """
    Convert a single file
    """
    if not Path(input_file).exists():
        print(f"Error: Input file '{input_file}' not found!")
        return False
    
    try:
        print(f"Converting {input_file} to JSON format...")
        entries = parse_steam_cache_file(input_file, ip_version)
        
        if entries:
            save_json(entries, output_file)
            print(f"Successfully converted {len(entries)} entries")
            
            # Show first few entries as example
            print(f"\nFirst 3 entries from {ip_version}:")
            for i, entry in enumerate(entries[:3]):
                print(f"{i+1}. {json.dumps(entry, ensure_ascii=False)}")
            return True
        else:
            print("No valid entries found in the file")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """
    Main function - convert both IPv4 and IPv6 files
    """
    files_to_convert = [
        ("data/steam-cache-v4.txt", "data/steam-cache-v4.json", "v4"),
        ("data/steam-cache-v6.txt", "data/steam-cache-v6.json", "v6")
    ]
    
    success_count = 0
    
    for input_file, output_file, ip_version in files_to_convert:
        print(f"\n{'='*50}")
        print(f"Processing {ip_version.upper()} data...")
        print(f"{'='*50}")
        
        if convert_file(input_file, output_file, ip_version):
            success_count += 1
    
    print(f"\n{'='*50}")
    print(f"Conversion Summary:")
    print(f"Successfully converted {success_count}/{len(files_to_convert)} files")
    print(f"{'='*50}")

if __name__ == "__main__":
    main() 