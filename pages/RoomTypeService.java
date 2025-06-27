package com.example.demo.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.request.RoomTypeRequestDto;
import com.example.demo.dto.response.RoomTypeResponseDto;
import com.example.demo.entity.Amenity;
import com.example.demo.entity.Hotel;
import com.example.demo.entity.RoomType;
import com.example.demo.repository.AmenityRepository;
import com.example.demo.repository.HotelRepository;
import com.example.demo.repository.RoomTypeRepository;

@Service
public class RoomTypeService {

	@Autowired
	private RoomTypeRepository roomTypeRepository;
	@Autowired
	private HotelRepository hotelRepository;
	@Autowired
	private AmenityRepository amenityRepository;

	public List<RoomTypeResponseDto> getAllRoomTypes() {
		return roomTypeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
	}

	public List<RoomTypeResponseDto> getRoomTypesByHotel(Long hotelId) {
		return roomTypeRepository.findByHotelId(hotelId).stream().map(this::toDto).collect(Collectors.toList());
	}

	public RoomTypeResponseDto saveRoomType(RoomTypeRequestDto dto) {
		Hotel hotel = hotelRepository.findById(dto.getHotelId())
				.orElseThrow(() -> new RuntimeException("Hotel not found"));

		Set<Amenity> amenities = dto.getAmenityIds() == null ? new HashSet<>()
				: new HashSet<>(amenityRepository.findAllById(dto.getAmenityIds()));

		RoomType room = toEntity(dto, hotel, amenities);
		RoomType saved = roomTypeRepository.save(room);
		return toDto(saved);
	}

	public Page<RoomTypeResponseDto> search(String keyword, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<RoomType> pageResult = roomTypeRepository.findByRnameContaining(keyword, pageable);
		return pageResult.map(this::toDto);
	}

	public RoomTypeResponseDto updateRoomType(Long id, RoomTypeRequestDto dto) {
		RoomType room = roomTypeRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("RoomType not found with id: " + id));

		Hotel hotel = hotelRepository.findById(dto.getHotelId())
				.orElseThrow(() -> new RuntimeException("Hotel not found with id: " + dto.getHotelId()));

		Set<Amenity> amenities = dto.getAmenityIds() == null ? Set.of()
				: new HashSet<>(amenityRepository.findAllById(dto.getAmenityIds()));

		room.setRname(dto.getRname());
		room.setPrice(dto.getPrice());
		room.setDescription(dto.getDescription());
		room.setSize(dto.getSize());
		room.setView(dto.getView());
		room.setImgUrl(dto.getImgUrl());
		room.setIsCanceled(dto.getIsCanceled());
		room.setQuantity(dto.getQuantity());
		room.setBedCount(dto.getBedCount());
		room.setBedType(dto.getBedType());
		room.setCapacity(dto.getCapacity());
		room.setHotel(hotel);
		room.setAmenities(amenities);
		RoomType saved = roomTypeRepository.save(room);
		return toDto(saved);
	}

	public void deleteRoomType(Long id) {
		if (!roomTypeRepository.existsById(id)) {
			throw new RuntimeException("RoomType not found with id: " + id);
		}
		roomTypeRepository.deleteById(id);
	}

	// toEntity方法
	private RoomType toEntity(RoomTypeRequestDto dto, Hotel hotel, Set<Amenity> amenities) {
		RoomType room = new RoomType();
		room.setRname(dto.getRname());
		room.setPrice(dto.getPrice());
		room.setDescription(dto.getDescription());
		room.setSize(dto.getSize());
		room.setView(dto.getView());
		room.setImgUrl(dto.getImgUrl());
		room.setIsCanceled(dto.getIsCanceled());
		room.setQuantity(dto.getQuantity());
		room.setBedCount(dto.getBedCount());
		room.setBedType(dto.getBedType());
		room.setCapacity(dto.getCapacity());
		room.setHotel(hotel);
		room.setAmenities(amenities);
		return room;
	}

	// toDto方法
	private RoomTypeResponseDto toDto(RoomType room) {
		RoomTypeResponseDto dto = new RoomTypeResponseDto();
		dto.setId(room.getId());
		dto.setHotelId(room.getHotel().getId());
		dto.setHotelName(room.getHotel().getHname());
		dto.setRname(room.getRname());
		dto.setPrice(room.getPrice());
		dto.setDescription(room.getDescription());
		dto.setSize(room.getSize());
		dto.setView(room.getView());
		dto.setImgUrl(room.getImgUrl());
		dto.setIsCanceled(room.getIsCanceled());
		dto.setQuantity(room.getQuantity());
		dto.setBedCount(room.getBedCount());
		dto.setBedType(room.getBedType());
		dto.setCapacity(room.getCapacity());

		Set<String> amenityNames = room.getAmenities().stream().map(Amenity::getAname).collect(Collectors.toSet());
		dto.setAmenities(amenityNames);

		return dto;
	}
}
