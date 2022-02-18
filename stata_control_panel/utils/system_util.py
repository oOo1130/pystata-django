import platform
import psutil

def _get_size(bytes, suffix="B"):
    """
    Scale bytes to its proper format
    e.g:
        1253656 => '1.20MB'
        1253656678 => '1.17GB'
    """
    factor = 1024
    for unit in ["", "K", "M", "G", "T", "P"]:
        if bytes < factor:
            return f"{bytes:.2f}{unit}{suffix}"
        bytes /= factor
        

def _sys_info():
    uname = platform.uname()
    result = "="*20 + "System Information" + "="*20
    result += f'\nSystem: {uname.system}\n' + \
                f'Node Name: {uname.node}\n'+ \
                f'Release: {uname.release}\n'+ \
                f'Version: {uname.version}\n'+ \
                f'Machine: {uname.machine}\n'+ \
                f'Processor: {uname.processor}\n'
    return result

def _cpu_info():
    result = "="*20 + "CPU Info" + "="*20
    # number of cores
    result += f'\nPhysical cores: {psutil.cpu_count(logical=False)}\n' + \
            f'Total cores: {psutil.cpu_count(logical=True)}\n'
    cpufreq = psutil.cpu_freq()
    result += f'Max Frequency: {cpufreq.max:.2f}Mhz\n' + \
                f'Min Frequency: {cpufreq.min:.2f}Mhz\n' + \
                f'Total CPU Usage: {psutil.cpu_percent()}%\n'
    return result

def _memory_info():
    result = "="*20 + "Memory Information" + "="*20
    # get the memory details
    svmem = psutil.virtual_memory()
    result += f'\nTotal: {_get_size(svmem.total)}\n' + \
                f'Available: {_get_size(svmem.available)}\n' + \
                f'Used: {_get_size(svmem.used)}\n' + \
                f'Percentage: {svmem.percent}%\n'
    result += ("="*20 + "SWAP" + "="*20)
    # get the swap memory details (if exists)
    swap = psutil.swap_memory()
    result += f'\nTotal: {_get_size(swap.total)}\n' + \
                f'Free: {_get_size(swap.free)}\n' + \
                f'Used: {_get_size(swap.used)}\n' + \
                f'Percentage: {swap.percent}%\n'
    return result


def get_summary_system():
    return _sys_info() + _cpu_info() + _memory_info()
