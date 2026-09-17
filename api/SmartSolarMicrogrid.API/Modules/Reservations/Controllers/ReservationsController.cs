using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;
using SmartSolarMicrogrid.API.Modules.Reservations.Services;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
    {
        try
        {
            var result = await _reservationService.CreateReservationAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidReservationDateException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred", Details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _reservationService.GetByIdAsync(id);
        if (result == null)
        {
            return NotFound(new { Message = "Reservation not found" });
        }
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReservation(string id, [FromBody] UpdateReservationDto dto)
    {
        try
        {
            await _reservationService.UpdateReservationAsync(id, dto);
            return Ok(new { Message = "Reservation updated successfully" });
        }
        catch (ReservationNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex) when (ex is InvalidReservationDateException || 
                                   ex is NoticePeriodViolationException || 
                                   ex is InvalidReservationStatusException)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred", Details = ex.Message });
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(string id, [FromBody] CancelReservationDto dto)
    {
        try
        {
            await _reservationService.CancelReservationAsync(id, dto);
            return Ok(new { Message = "Reservation cancelled successfully" });
        }
        catch (ReservationNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex) when (ex is NoticePeriodViolationException || 
                                   ex is InvalidReservationStatusException)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred", Details = ex.Message });
        }
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending([FromQuery] string? nic)
    {
        var result = await _reservationService.GetPendingAsync(nic);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] string? nic)
    {
        var result = await _reservationService.GetHistoryAsync(nic);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? nic, 
        [FromQuery] string? status, 
        [FromQuery] DateTime? from, 
        [FromQuery] DateTime? to)
    {
        var result = await _reservationService.SearchAsync(nic, status, from, to);
        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] string? nic)
    {
        var count = await _reservationService.GetApprovedFutureCountAsync(nic);
        return Ok(new { ApprovedFutureCount = count });
    }
}
